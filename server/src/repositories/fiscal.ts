import { query } from '../db/connection';

export async function saveNFe55(data: {
  id: string;
  numero?: string;
  serie?: string;
  emissao?: string;
  codigoAcesso?: string;
  emitente?: any;
  destinatario?: any;
  itens?: any;
  totais?: any;
  transporte?: any;
  adicionais?: any;
  xml?: string;
  status?: string;
  protocolo?: string | null;
}) {
  const sql = `insert into nfe55 (id, numero, serie, emissao, codigo_acesso, emitente, destinatario, itens, totais, transporte, adicionais, xml, status, protocolo)
               values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
               returning id, numero, serie, emissao, codigo_acesso as "codigoAcesso", emitente, destinatario, itens, totais, transporte, adicionais, xml, status, protocolo, created_at as "createdAt"`;
  const params = [
    data.id,
    data.numero ?? null,
    data.serie ?? null,
    data.emissao ?? null,
    data.codigoAcesso ?? null,
    data.emitente ?? null,
    data.destinatario ?? null,
    data.itens ?? null,
    data.totais ?? null,
    data.transporte ?? null,
    data.adicionais ?? null,
    data.xml ?? null,
    data.status ?? null,
    data.protocolo ?? null,
  ];
  const { rows } = await query(sql, params);
  return rows[0];
}

export async function saveCTe57(data: {
  id: string;
  numero?: string;
  serie?: string;
  dataHoraEmissao?: string;
  tipoEmissao?: string;
  modal?: string;
  municipioInicio?: string;
  municipioFim?: string;
  tipoServico?: string;
  emitente?: any;
  tomador?: any;
  remetente?: any;
  destinatario?: any;
  chavesNFe?: any;
  vPrest?: number;
  componentes?: any;
  cst?: string;
  icms?: any;
  rntrc?: string;
  veiculo?: any;
  motorista?: any;
  observacoes?: string;
  xml?: string;
  status?: string;
  protocolo?: string | null;
}) {
  const sql = `insert into cte57 (id, numero, serie, data_hora_emissao, tipo_emissao, modal, municipio_inicio, municipio_fim, tipo_servico, emitente, tomador, remetente, destinatario, chaves_nfe, vprest, componentes, cst, icms, rntrc, veiculo, motorista, observacoes, xml, status, protocolo)
               values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
               returning id, numero, serie, data_hora_emissao as "dataHoraEmissao", tipo_emissao as "tipoEmissao", modal, municipio_inicio as "municipioInicio", municipio_fim as "municipioFim", tipo_servico as "tipoServico", emitente, tomador, remetente, destinatario, chaves_nfe as "chavesNFe", vprest as "vPrest", componentes, cst, icms, rntrc, veiculo, motorista, observacoes, xml, status, protocolo, created_at as "createdAt"`;
  const params = [
    data.id,
    data.numero ?? null,
    data.serie ?? null,
    data.dataHoraEmissao ?? null,
    data.tipoEmissao ?? null,
    data.modal ?? null,
    data.municipioInicio ?? null,
    data.municipioFim ?? null,
    data.tipoServico ?? null,
    data.emitente ?? null,
    data.tomador ?? null,
    data.remetente ?? null,
    data.destinatario ?? null,
    data.chavesNFe ?? null,
    data.vPrest ?? null,
    data.componentes ?? null,
    data.cst ?? null,
    data.icms ?? null,
    data.rntrc ?? null,
    data.veiculo ?? null,
    data.motorista ?? null,
    data.observacoes ?? null,
    data.xml ?? null,
    data.status ?? null,
    data.protocolo ?? null,
  ];
  const { rows } = await query(sql, params);
  return rows[0];
}