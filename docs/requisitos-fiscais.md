# Requisitos Fiscais – NF-e (55) e CT-e (57)

Este documento lista os campos mínimos e o comportamento esperado para emissão de **NF-e (modelo 55)** e **CT-e (modelo 57)**, com opção de impressão de **DANFE** (NF-e) e **DACTE** (CT-e).

## NF-e – Modelo 55
1. Dados da NF-e
   - Número e Série: identificação única da nota.
   - Data e Hora de Emissão.
   - Código de Acesso (44 dígitos).
2. Emitente
   - Nome/Razão Social.
   - CNPJ.
   - Inscrição Estadual (IE).
   - Endereço completo.
3. Destinatário
   - Nome/Razão Social.
   - CNPJ ou CPF.
   - Inscrição Estadual (IE), se contribuinte.
   - Endereço completo.
4. Produtos/Serviços
   - Descrição do item.
   - Quantidade e unidade.
   - Valor unitário e total.
   - CFOP e NCM.
   - Tributos: ICMS, IPI, PIS, COFINS (códigos e valores).
5. Totais
   - Total de produtos.
   - Totais de ICMS, IPI, PIS, COFINS e outros.
   - Valor total da NF-e.
6. Transporte
   - Modalidade (remetente/destinatário).
   - Transportadora.
   - Placa do veículo.
7. Dados Adicionais
   - Informações complementares de interesse do contribuinte.
   - Armazenamento/Anexo do XML.
   - Impressão de **DANFE**.

> Observações: incluir validações de schema, cálculo de impostos conforme configuração tributária e regras estaduais/municipais aplicáveis.

## CT-e – Modelo 57
Campos principais conforme anexo (ver `modelo 57.png`). Abaixo, resumo dos campos operacionais:
- Número, Série, Data e Hora de Emissão (modelo 57).
- Tipo de Emissão (Normal/Contingência).
- Modal (Rodoviário, Aéreo, etc.).
- Municípios de Início/Fim (cMunIni/cMunFim – IBGE).
- Tipo de Serviço (Subcontratação, Redespacho, etc.).
- Emitente (CNPJ, IE, Razão Social, Endereço).
- Tomador do Serviço (CNPJ/CPF, endereço, atenção máxima).
- Remetente/Destinatário/Expedidor/Recebedor (CNPJ/CPF, IE, endereço – condicionais).
- Chave(s) de Acesso da NF-e relacionada (44 dígitos).
- Valor Total da Carga e Produto Predominante.
- Valor da Prestação (vPrest) – total cobrado, com impostos.
- Componentes do Valor (frete, taxas, pedágio) – recomendado listar.
- CST/CSOSN – situação tributária (ex.: 00, 40 – isenta).
- Base de Cálculo, Alíquota e Valor de ICMS (se tributado).
- RNTRC do Emitente.
- Veículo de Tração (placa/renavam) e Motorista (CPF/Nome).
- Observações Gerais (livre) e Informações Adicionais Fisco.

### Impressão
- Geração do **DACTE** (espelho) para conferência/entrega.
- Layout conforme especificação oficial, com QRCode/chave de acesso quando aplicável.

## Fluxo de Emissão
- Preparar dados (validação e cálculos).
- Assinar digitalmente com certificado A1/A3.
- Enviar para SEFAZ (autorização).
- Armazenar XML e protocolo.
- Disponibilizar DANFE/DACTE para impressão/download.

## Integração e Configuração Tributária
- Tabelas de CFOP, NCM, CST/CSOSN, alíquotas.
- Regras por UF (origem/destino) e regime tributário.
- Logs/auditoria de alterações e eventos (carta de correção, cancelamento, etc.).