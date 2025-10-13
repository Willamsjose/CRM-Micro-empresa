import { z } from 'zod';
export interface NFeEmitente {
  nome: string;
  cnpj: string;
  ie?: string;
  endereco: any;
}

export interface NFeDestinatario {
  nome: string;
  documento: string; // CNPJ ou CPF
  ie?: string;
  endereco: any;
}

export interface NFeItem {
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  cfop: string;
  ncm: string;
  impostos?: {
    icms?: any;
    ipi?: any;
    pis?: any;
    cofins?: any;
  };
}

export interface NFe55 {
  numero: string;
  serie: string;
  emissao: string; // ISO datetime
  codigoAcesso: string; // 44 dígitos
  emitente: NFeEmitente;
  destinatario: NFeDestinatario;
  itens: NFeItem[];
  totais: {
    totalProdutos: number;
    totalImpostos?: { icms?: number; ipi?: number; pis?: number; cofins?: number; outros?: number };
    valorTotal: number;
  };
  transporte?: { modalidade?: string; transportadora?: string; placa?: string };
  adicionais?: { informacoes?: string; xml?: string };
}

export const NFe55Schema = z.object({
  numero: z.string().min(1),
  serie: z.string().min(1),
  emissao: z.string().min(1),
  codigoAcesso: z.string().length(44),
  emitente: z.object({
    nome: z.string().min(1),
    cnpj: z.string().min(11),
    ie: z.string().optional(),
    endereco: z.any(),
  }),
  destinatario: z.object({
    nome: z.string().min(1),
    documento: z.string().min(11),
    ie: z.string().optional(),
    endereco: z.any(),
  }),
  itens: z
    .array(
      z.object({
        descricao: z.string().min(1),
        quantidade: z.number().positive(),
        unidade: z.string().min(1),
        valorUnitario: z.number().nonnegative(),
        cfop: z.string().min(1),
        ncm: z.string().min(2),
        impostos: z
          .object({ icms: z.any().optional(), ipi: z.any().optional(), pis: z.any().optional(), cofins: z.any().optional() })
          .optional(),
      })
    )
    .min(1),
  totais: z.object({
    totalProdutos: z.number(),
    totalImpostos: z
      .object({ icms: z.number().optional(), ipi: z.number().optional(), pis: z.number().optional(), cofins: z.number().optional(), outros: z.number().optional() })
      .optional(),
    valorTotal: z.number(),
  }),
  transporte: z.object({ modalidade: z.string().optional(), transportadora: z.string().optional(), placa: z.string().optional() }).optional(),
  adicionais: z.object({ informacoes: z.string().optional(), xml: z.string().optional() }).optional(),
});

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function validateNFe(payload: Partial<NFe55>) {
  const parse = NFe55Schema.safeParse(payload);
  if (parse.success) return { valid: true, missing: [], errors: [] };
  const issues = parse.error.issues || [];
  const requiredKeys: Array<keyof NFe55> = ['numero', 'serie', 'emissao', 'codigoAcesso', 'emitente', 'destinatario', 'itens', 'totais'];
  const missing = requiredKeys.filter((k) => (payload[k] as unknown) === undefined || (payload[k] as unknown) === null);
  const errors = issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  return { valid: false, missing, errors };
}

export function buildNFeXml(nfe: NFe55) {
  const itemsXml = nfe.itens
    .map((i, idx) => `\n    <det nItem="${idx + 1}">\n      <prod>\n        <cProd>${escapeXml(i.ncm)}</cProd>\n        <xProd>${escapeXml(i.descricao)}</xProd>\n        <CFOP>${escapeXml(i.cfop)}</CFOP>\n        <uCom>${escapeXml(i.unidade)}</uCom>\n        <qCom>${i.quantidade}</qCom>\n        <vUnCom>${i.valorUnitario.toFixed(2)}</vUnCom>\n        <vProd>${(i.quantidade * i.valorUnitario).toFixed(2)}</vProd>\n      </prod>\n    </det>`)
    .join('');

  const totalImpostos = nfe.totais.totalImpostos || {};
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<NFe>\n  <infNFe>\n    <ide>\n      <cNF>${escapeXml(nfe.numero)}</cNF>\n      <serie>${escapeXml(nfe.serie)}</serie>\n      <dhEmi>${escapeXml(nfe.emissao)}</dhEmi>\n      <cDV>${escapeXml(nfe.codigoAcesso)}</cDV>\n    </ide>\n    <emit>\n      <xNome>${escapeXml(nfe.emitente.nome)}</xNome>\n      <CNPJ>${escapeXml(nfe.emitente.cnpj)}</CNPJ>\n    </emit>\n    <dest>\n      <xNome>${escapeXml(nfe.destinatario.nome)}</xNome>\n      <doc>${escapeXml(nfe.destinatario.documento)}</doc>\n    </dest>\n    ${itemsXml}\n    <total>\n      <ICMSTot>\n        <vProd>${nfe.totais.totalProdutos.toFixed(2)}</vProd>\n        <vICMS>${(totalImpostos.icms ?? 0).toFixed(2)}</vICMS>\n        <vIPI>${(totalImpostos.ipi ?? 0).toFixed(2)}</vIPI>\n        <vPIS>${(totalImpostos.pis ?? 0).toFixed(2)}</vPIS>\n        <vCOFINS>${(totalImpostos.cofins ?? 0).toFixed(2)}</vCOFINS>\n        <vNF>${nfe.totais.valorTotal.toFixed(2)}</vNF>\n      </ICMSTot>\n    </total>\n  </infNFe>\n</NFe>`;
  return xml;
}

export function buildDanfeHtml(nfe: NFe55) {
  const rows = nfe.itens
    .map(
      (i) =>
        `<tr><td>${i.descricao}</td><td>${i.quantidade} ${i.unidade}</td><td>${i.valorUnitario.toFixed(
          2
        )}</td><td>${(i.quantidade * i.valorUnitario).toFixed(2)}</td></tr>`
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>DANFE Preview</title>
  <style>body{font-family:Arial,sans-serif}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head>
  <body>
  <h1>DANFE (Pré-visualização)</h1>
  <p>NF-e: ${nfe.numero}/${nfe.serie} | Emissão: ${nfe.emissao}</p>
  <p>Emitente: ${nfe.emitente.nome} | CNPJ: ${nfe.emitente.cnpj}</p>
  <p>Destinatário: ${nfe.destinatario.nome} | Doc: ${nfe.destinatario.documento}</p>
  <table><thead><tr><th>Descrição</th><th>Qtd</th><th>Vlr Unit</th><th>Vlr Total</th></tr></thead><tbody>${rows}</tbody></table>
  <p>Valor Total: R$ ${nfe.totais.valorTotal.toFixed(2)}</p>
  </body></html>`;
}