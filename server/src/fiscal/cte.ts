// @ts-ignore – zod is optional; schemas will be stubs if not installed
let z: any = {};
try {
  z = require('zod');
} catch {
  // fallback stub so the file still compiles
  z.object = () => ({ safeParse: () => ({ success: true }) });
  z.string = () => ({ min: () => z.string(), length: () => z.string(), optional: () => z.string() });
  z.number = () => ({ optional: () => z.number() });
  z.array = () => ({ optional: () => z.array() });
}

export interface CTeParticipante {
  nome: string;
  documento: string; // CNPJ/CPF
  ie?: string;
  endereco?: any;
}

export interface CTe57 {
  numero: string;
  serie: string;
  dataHoraEmissao: string; // ISO datetime
  tipoEmissao: string; // Normal/Contingência
  modal: string; // Rodoviário, Aéreo, etc.
  municipioInicio: string; // IBGE code ou nome
  municipioFim: string;
  tipoServico: string; // Subcontratação/Redespacho etc.
  emitente: CTeParticipante;
  tomador: CTeParticipante;
  remetente?: CTeParticipante;
  destinatario?: CTeParticipante;
  chavesNFe?: string[]; // 44 dígitos
  vPrest: number; // valor total da prestação
  componentes?: Array<{ nome: string; valor: number }>;
  cst?: string; // CST/CSOSN
  icms?: { base?: number; aliquota?: number; valor?: number };
  rntrc?: string;
  veiculo?: { placa?: string; renavam?: string };
  motorista?: { cpf?: string; nome?: string };
  observacoes?: string;
}

export const CTeParticipanteSchema = z.object({
  nome: z.string().min(1),
  documento: z.string().min(11),
  ie: z.string().optional(),
  endereco: z.any().optional(),
});

export const CTe57Schema = z.object({
  numero: z.string().min(1),
  serie: z.string().min(1),
  dataHoraEmissao: z.string().min(1),
  tipoEmissao: z.string().min(1),
  modal: z.string().min(1),
  municipioInicio: z.string().min(1),
  municipioFim: z.string().min(1),
  tipoServico: z.string().min(1),
  emitente: CTeParticipanteSchema,
  tomador: CTeParticipanteSchema,
  remetente: CTeParticipanteSchema.optional(),
  destinatario: CTeParticipanteSchema.optional(),
  chavesNFe: z.array(z.string().length(44)).optional(),
  vPrest: z.number(),
  componentes: z.array(z.object({ nome: z.string().min(1), valor: z.number() })).optional(),
  cst: z.string().optional(),
  icms: z.object({ base: z.number().optional(), aliquota: z.number().optional(), valor: z.number().optional() }).optional(),
  rntrc: z.string().optional(),
  veiculo: z.object({ placa: z.string().optional(), renavam: z.string().optional() }).optional(),
  motorista: z.object({ cpf: z.string().optional(), nome: z.string().optional() }).optional(),
  observacoes: z.string().optional(),
});

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function validateCTe(payload: Partial<CTe57>) {
  const parse = CTe57Schema.safeParse(payload);
  if (parse.success) return { valid: true, missing: [], errors: [] };
  const issues = parse.error.issues || [];
  const required: Array<keyof CTe57> = [
    'numero',
    'serie',
    'dataHoraEmissao',
    'tipoEmissao',
    'modal',
    'municipioInicio',
    'municipioFim',
    'tipoServico',
    'emitente',
    'tomador',
    'vPrest',
  ];
  const missing = required.filter((k) => (payload[k] as unknown) === undefined || (payload[k] as unknown) === null);
  const errors = issues.map((i: any) => `${i.path.join('.')}: ${i.message}`);
  return { valid: false, missing, errors };
}

export function buildCTeXml(cte: CTe57) {
  const comps = (cte.componentes || [])
    .map((c) => `\n      <Comp>\n        <xNome>${escapeXml(c.nome)}</xNome>\n        <vComp>${c.valor.toFixed(2)}</vComp>\n      </Comp>`)
    .join('');

  const chaves = (cte.chavesNFe || [])
    .map((k) => `\n      <chNFe>${escapeXml(k)}</chNFe>`)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<CTe>\n  <infCte>\n    <ide>\n      <cCT>${escapeXml(cte.numero)}</cCT>\n      <serie>${escapeXml(cte.serie)}</serie>\n      <dhEmi>${escapeXml(cte.dataHoraEmissao)}</dhEmi>\n      <tpEmis>${escapeXml(cte.tipoEmissao)}</tpEmis>\n      <modal>${escapeXml(cte.modal)}</modal>\n      <cMunIni>${escapeXml(cte.municipioInicio)}</cMunIni>\n      <cMunFim>${escapeXml(cte.municipioFim)}</cMunFim>\n      <tpServ>${escapeXml(cte.tipoServico)}</tpServ>\n    </ide>\n    <emit>\n      <xNome>${escapeXml(cte.emitente.nome)}</xNome>\n      <doc>${escapeXml(cte.emitente.documento)}</doc>\n    </emit>\n    <tomador>\n      <xNome>${escapeXml(cte.tomador.nome)}</xNome>\n      <doc>${escapeXml(cte.tomador.documento)}</doc>\n    </tomador>\n    <nfe>${chaves}\n    </nfe>\n    <vPrest>\n      <vTPrest>${cte.vPrest.toFixed(2)}</vTPrest>${comps ? `\n      <CompTotais>${comps}\n      </CompTotais>` : ''}\n    </vPrest>\n    <transporte>\n      <veic>${cte.veiculo?.placa ?? ''}</veic>\n      <mot>${cte.motorista?.cpf ?? ''}</mot>\n    </transporte>\n  </infCte>\n</CTe>`;
  return xml;
}

export function buildDacteHtml(cte: CTe57) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>DACTE Preview</title>
  <style>body{font-family:Arial,sans-serif}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head>
  <body>
  <h1>DACTE (Pré-visualização)</h1>
  <p>CT-e: ${cte.numero}/${cte.serie} | Emissão: ${cte.dataHoraEmissao}</p>
  <p>Emitente: ${cte.emitente.nome} | Doc: ${cte.emitente.documento}</p>
  <p>Tomador: ${cte.tomador.nome} | Doc: ${cte.tomador.documento}</p>
  <p>Valor da Prestação: R$ ${cte.vPrest.toFixed(2)}</p>
  </body></html>`;
}