import axios from 'axios';

export type Ambiente = 'homologacao' | 'producao';

export interface AutorizacaoResult {
  ok: boolean;
  statusCode?: number;
  protocolo?: string | null;
  rawResponse?: string;
  notConfigured?: true;
  message?: string;
}

export interface ConsultaResult {
  ok: boolean;
  statusCode?: number;
  status?: string | null;
  rawResponse?: string;
  notConfigured?: true;
  message?: string;
}

function pickEnv(envVar: string | undefined, def?: string) {
  return envVar && envVar.trim().length > 0 ? envVar : def;
}

function getUrls(model: 'nfe' | 'cte', ambiente: Ambiente) {
  if (model === 'nfe') {
    return {
      autorizacao:
        ambiente === 'homologacao'
          ? pickEnv(process.env.NFE_HML_AUTH_URL)
          : pickEnv(process.env.NFE_PRD_AUTH_URL),
      consulta:
        ambiente === 'homologacao'
          ? pickEnv(process.env.NFE_HML_CONSULT_URL)
          : pickEnv(process.env.NFE_PRD_CONSULT_URL),
      soapActionAuth: pickEnv(process.env.NFE_SOAP_ACTION_AUTH),
      soapActionConsult: pickEnv(process.env.NFE_SOAP_ACTION_CONSULT),
    };
  }
  return {
    autorizacao:
      ambiente === 'homologacao' ? pickEnv(process.env.CTE_HML_AUTH_URL) : pickEnv(process.env.CTE_PRD_AUTH_URL),
    consulta:
      ambiente === 'homologacao' ? pickEnv(process.env.CTE_HML_CONSULT_URL) : pickEnv(process.env.CTE_PRD_CONSULT_URL),
    soapActionAuth: pickEnv(process.env.CTE_SOAP_ACTION_AUTH),
    soapActionConsult: pickEnv(process.env.CTE_SOAP_ACTION_CONSULT),
  };
}

function buildEnvelope(tag: string, xml: string) {
  // Envelope genérico; ambientes reais exigem namespaces/estruturas específicas
  return `<?xml version="1.0" encoding="UTF-8"?>
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <${tag}><![CDATA[${xml}]]></${tag}>
    </soap:Body>
  </soap:Envelope>`;
}

export async function enviarAutorizacao(
  model: 'nfe' | 'cte',
  xml: string,
  ambiente: Ambiente = 'homologacao'
): Promise<AutorizacaoResult> {
  const urls = getUrls(model, ambiente);
  if (!urls.autorizacao) {
    return { ok: false, notConfigured: true, message: 'URL de autorização não configurada para o ambiente' };
  }
  const tag = model === 'nfe' ? 'enviNFe' : 'enviCTe';
  const envelope = buildEnvelope(tag, xml);
  const headers: Record<string, string> = { 'Content-Type': 'text/xml; charset=utf-8' };
  if (urls.soapActionAuth) headers['SOAPAction'] = urls.soapActionAuth;
  const resp = await axios.post(urls.autorizacao, envelope, { headers });
  const raw = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
  // Heurística simples para extrair um 'protocolo' de testes
  const protocolo = /<prot\w*>\s*([\w-.:]+)\s*<\/prot/i.exec(raw)?.[1] || null;
  return { ok: true, statusCode: resp.status, protocolo, rawResponse: raw };
}

export async function consultarSituacao(
  model: 'nfe' | 'cte',
  chaveOuProtocolo: string,
  ambiente: Ambiente = 'homologacao'
): Promise<ConsultaResult> {
  const urls = getUrls(model, ambiente);
  if (!urls.consulta) {
    return { ok: false, notConfigured: true, message: 'URL de consulta não configurada para o ambiente' };
  }
  const tag = model === 'nfe' ? 'consSitNFe' : 'consSitCTe';
  const payload = `<consulta><id>${chaveOuProtocolo}</id></consulta>`;
  const envelope = buildEnvelope(tag, payload);
  const headers: Record<string, string> = { 'Content-Type': 'text/xml; charset=utf-8' };
  if (urls.soapActionConsult) headers['SOAPAction'] = urls.soapActionConsult;
  const resp = await axios.post(urls.consulta, envelope, { headers });
  const raw = typeof resp.data === 'string' ? resp.data : JSON.stringify(resp.data);
  // Heurística simples para status
  const status = /<cStat>(\d+)<\/cStat>/.exec(raw)?.[1] || null;
  return { ok: true, statusCode: resp.status, status, rawResponse: raw };
}