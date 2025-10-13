import { Router } from 'express';
import { validateNFe, buildNFeXml, buildDanfeHtml } from '../fiscal/nfe';
import { validateCTe, buildCTeXml, buildDacteHtml } from '../fiscal/cte';
import { loadA1FromPfx, signXmlEnveloped } from '../fiscal/signature';
import { enviarAutorizacao, consultarSituacao, Ambiente, AutorizacaoResult, ConsultaResult } from '../fiscal/sefaz';
import { saveNFe55, saveCTe57 } from '../repositories/fiscal';

const router = Router();

// NF-e 55
router.post('/nfe55/validate', (req, res) => {
  const payload = req.body || {};
  const result = validateNFe(payload);
  res.json({ modelo: 55, ...result });
});

router.post('/nfe55/xml', (req, res) => {
  const payload = req.body || {};
  const result = validateNFe(payload);
  if (!result.valid) return res.status(400).json({ modelo: 55, ...result });
  let xml = buildNFeXml(payload);
  try {
    if ((req.query.sign as string) === 'true') {
      const pfxPath = process.env.A1_PFX_PATH;
      const pfxPass = process.env.A1_PFX_PASSWORD;
      if (!pfxPath || !pfxPass) return res.status(400).json({ error: 'A1_PFX_PATH e A1_PFX_PASSWORD ausentes no .env' });
      const { certPem, keyPem } = loadA1FromPfx(pfxPath, pfxPass);
      xml = signXmlEnveloped(xml, 'NFe', keyPem, certPem);
    }
    res.type('application/xml').send(xml);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Erro ao assinar NF-e', e);
    res.status(500).json({ error: 'Falha ao assinar XML de NF-e', detail: msg });
  }
});

router.post('/nfe55/danfe/preview', (req, res) => {
  const payload = req.body || {};
  const result = validateNFe(payload);
  if (!result.valid) return res.status(400).json({ modelo: 55, ...result });
  const html = buildDanfeHtml(payload);
  res.type('text/html').send(html);
});

// CT-e 57
router.post('/cte57/validate', (req, res) => {
  const payload = req.body || {};
  const result = validateCTe(payload);
  res.json({ modelo: 57, ...result });
});

router.post('/cte57/xml', (req, res) => {
  const payload = req.body || {};
  const result = validateCTe(payload);
  if (!result.valid) return res.status(400).json({ modelo: 57, ...result });
  let xml = buildCTeXml(payload);
  try {
    if ((req.query.sign as string) === 'true') {
      const pfxPath = process.env.A1_PFX_PATH;
      const pfxPass = process.env.A1_PFX_PASSWORD;
      if (!pfxPath || !pfxPass) return res.status(400).json({ error: 'A1_PFX_PATH e A1_PFX_PASSWORD ausentes no .env' });
      const { certPem, keyPem } = loadA1FromPfx(pfxPath, pfxPass);
      xml = signXmlEnveloped(xml, 'CTe', keyPem, certPem);
    }
    res.type('application/xml').send(xml);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Erro ao assinar CT-e', e);
    res.status(500).json({ error: 'Falha ao assinar XML de CT-e', detail: msg });
  }
});

router.post('/cte57/dacte/preview', (req, res) => {
  const payload = req.body || {};
  const result = validateCTe(payload);
  if (!result.valid) return res.status(400).json({ modelo: 57, ...result });
  const html = buildDacteHtml(payload);
  res.type('text/html').send(html);
});

// SEFAZ - Autorização e Consulta (genérico, ambiente via env ou query)
router.post('/nfe55/authorize', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = validateNFe(payload);
    if (!result.valid) return res.status(400).json({ modelo: 55, ...result });
    const ambiente: Ambiente = (req.query.env as string) === 'producao' || process.env.SEFAZ_ENV === 'producao' ? 'producao' : 'homologacao';
    let xml = buildNFeXml(payload);
    if ((req.query.sign as string) === 'true') {
      const pfxPath = process.env.A1_PFX_PATH;
      const pfxPass = process.env.A1_PFX_PASSWORD;
      if (!pfxPath || !pfxPass) return res.status(400).json({ error: 'A1_PFX_PATH e A1_PFX_PASSWORD ausentes no .env' });
      const { certPem, keyPem } = loadA1FromPfx(pfxPath, pfxPass);
      xml = signXmlEnveloped(xml, 'NFe', keyPem, certPem);
    }
    const sefaz: AutorizacaoResult = await enviarAutorizacao('nfe', xml, ambiente);
    if (sefaz.notConfigured) return res.status(501).json({ error: 'SEFAZ não configurado', detail: sefaz });
    const saved = await saveNFe55({
      id: payload.codigoAcesso || `${Date.now()}`,
      numero: payload.numero,
      serie: payload.serie,
      emissao: payload.emissao,
      codigoAcesso: payload.codigoAcesso,
      emitente: payload.emitente,
      destinatario: payload.destinatario,
      itens: payload.itens,
      totais: payload.totais,
      transporte: payload.transporte,
      adicionais: payload.adicionais,
      xml,
      status: sefaz.ok ? 'enviado' : 'erro',
      protocolo: sefaz.protocolo ?? null,
    });
    res.json({ ok: true, ambiente, sefaz, registro: saved });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Erro autorização NF-e', e);
    res.status(500).json({ error: 'Falha na autorização NF-e', detail: msg });
  }
});

router.post('/nfe55/consult', async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Informe "id" (chave ou protocolo) no corpo' });
    const ambiente: Ambiente = (req.query.env as string) === 'producao' || process.env.SEFAZ_ENV === 'producao' ? 'producao' : 'homologacao';
    const resp: ConsultaResult = await consultarSituacao('nfe', id, ambiente);
    if (resp.notConfigured) return res.status(501).json({ error: 'SEFAZ não configurado', detail: resp });
    res.json({ ok: true, ambiente, consulta: resp });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Erro consulta NF-e', e);
    res.status(500).json({ error: 'Falha na consulta NF-e', detail: msg });
  }
});

router.post('/cte57/authorize', async (req, res) => {
  try {
    const payload = req.body || {};
    const result = validateCTe(payload);
    if (!result.valid) return res.status(400).json({ modelo: 57, ...result });
    const ambiente: Ambiente = (req.query.env as string) === 'producao' || process.env.SEFAZ_ENV === 'producao' ? 'producao' : 'homologacao';
    let xml = buildCTeXml(payload);
    if ((req.query.sign as string) === 'true') {
      const pfxPath = process.env.A1_PFX_PATH;
      const pfxPass = process.env.A1_PFX_PASSWORD;
      if (!pfxPath || !pfxPass) return res.status(400).json({ error: 'A1_PFX_PATH e A1_PFX_PASSWORD ausentes no .env' });
      const { certPem, keyPem } = loadA1FromPfx(pfxPath, pfxPass);
      xml = signXmlEnveloped(xml, 'CTe', keyPem, certPem);
    }
    const sefaz: AutorizacaoResult = await enviarAutorizacao('cte', xml, ambiente);
    if (sefaz.notConfigured) return res.status(501).json({ error: 'SEFAZ não configurado', detail: sefaz });
    const saved = await saveCTe57({
      id: `CTE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      numero: payload.numero,
      serie: payload.serie,
      dataHoraEmissao: payload.dataHoraEmissao,
      tipoEmissao: payload.tipoEmissao,
      modal: payload.modal,
      municipioInicio: payload.municipioInicio,
      municipioFim: payload.municipioFim,
      tipoServico: payload.tipoServico,
      emitente: payload.emitente,
      tomador: payload.tomador,
      remetente: payload.remetente,
      destinatario: payload.destinatario,
      chavesNFe: payload.chavesNFe,
      vPrest: payload.vPrest,
      componentes: payload.componentes,
      cst: payload.cst,
      icms: payload.icms,
      rntrc: payload.rntrc,
      veiculo: payload.veiculo,
      motorista: payload.motorista,
      observacoes: payload.observacoes,
      xml,
      status: sefaz.ok ? 'enviado' : 'erro',
      protocolo: sefaz.protocolo ?? null,
    });
    res.json({ ok: true, ambiente, sefaz, registro: saved });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Erro autorização CT-e', e);
    res.status(500).json({ error: 'Falha na autorização CT-e', detail: msg });
  }
});

router.post('/cte57/consult', async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Informe "id" (chave ou protocolo) no corpo' });
    const ambiente: Ambiente = (req.query.env as string) === 'producao' || process.env.SEFAZ_ENV === 'producao' ? 'producao' : 'homologacao';
    const resp: ConsultaResult = await consultarSituacao('cte', id, ambiente);
    if (resp.notConfigured) return res.status(501).json({ error: 'SEFAZ não configurado', detail: resp });
    res.json({ ok: true, ambiente, consulta: resp });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('Erro consulta CT-e', e);
    res.status(500).json({ error: 'Falha na consulta CT-e', detail: msg });
  }
});

export default router;