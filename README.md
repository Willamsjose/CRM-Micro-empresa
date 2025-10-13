# CRM Micro Empresa – Projeto (Português)

Sistema completo de CRM, Vendas, Fiscal e Financeiro para micro empresas, com front-end responsivo e backend em Node.js.

## Módulos Planejados
- Pedidos, Clientes, Produtos (fotos e vídeos)
- Etiquetas de código de barras e prateleira
- Controle de estoque com histórico de movimentações
- Fornecedores, Empresas Representadas e Transportadoras
- Tabela de Preços, Condições de Pagamento, Contas a Receber/Pagar
- CRM (Agendas), Equipe de Vendas, Metas
- Relatórios analíticos e sintéticos (PDF/Excel)
- Integrações de API, Importação/Exportação via Excel
- Intermediários de pagamento (Asaas, PagSeguro, Mastercard, Visa, Hiper)
- NF-e (modelo 55) e NFC-e, CT-e (modelo 57) com impressão de DANFE/DACTE
- Configuração tributária, Importação de XML
- Checkout de pedidos, PDV (Caixa)
- Integração com Marketplaces, Boletos
- Fluxo de caixa, Controle de contas correntes, Manifestação do destinatário
- Multiusuários, SPED

## Arquitetura Inicial
- `server/`: Backend Node.js (Express + TypeScript)
- `web/`: Front-end (a ser criado) em React
- `docs/`: Documentação funcional e fiscal (NF-e/CT-e)

## Requisitos
- Node.js 18+ e npm
 - PostgreSQL 14+ (desenvolvimento)

## Desenvolvimento – Backend
1. Acesse `server/`
2. Instale as dependências: `npm install`
3. Execute em desenvolvimento: `npm run dev`
4. Verifique `http://localhost:3000/health` para status da API.

### Banco de Dados (PostgreSQL)
- Configure a variável `DATABASE_URL` no `.env` em `server/`, por exemplo:
```
DATABASE_URL=postgres://usuario:senha@localhost:5432/crm_micro
```

- Crie o banco e aplique a migration inicial:
  - Windows (psql):
    - `createdb crm_micro` (se necessário)
    - `psql -d crm_micro -f server/db/migrations/001_init.sql`

- O servidor usa `pg` com connection pool. As rotas de Clientes e Pedidos já persistem no PostgreSQL.
  - Agora também persistem: Produtos, Movimentações/Saldo de Estoque, Fornecedores e Transportadoras.

### Configuração de Autenticação (.env)
Crie um arquivo `.env` em `server/` com suas chaves:

```
ADMIN_API_KEY=admin-secret-123
REP_KEYS_JSON={"rep-01":"rep-key-01","rep-02":"rep-key-02"}
DATABASE_URL=postgres://usuario:senha@localhost:5432/crm_micro
A1_PFX_PATH=c:\certificados\empresa.pfx
A1_PFX_PASSWORD=senha-do-certificado
```

- Envie a chave via header `x-api-key`.
- `ADMIN_API_KEY` concede papel `admin`.
- Em `REP_KEYS_JSON`, o valor é a chave usada pelo representante e a chave do objeto é o `id` do representante.

### Rotas Principais (inicial)
- `GET /health` – sem autenticação.
- `GET /auth/whoami` – autenticado, retorna usuário logado.
- `GET/POST /api/customers` – clientes (filtrados por representante).
- `GET/POST /api/orders` – pedidos (filtrados por representante).
- `GET/POST /api/products` – produtos com fotos e vídeos.
- `POST /api/fiscal/nfe55/validate` – validação de campos NF-e 55.
- `POST /api/fiscal/nfe55/xml` – gera XML simplificado (application/xml).
- `POST /api/fiscal/nfe55/danfe/preview` – preview DANFE (HTML).
- `POST /api/fiscal/cte57/validate` – validação de campos CT-e 57.
- `POST /api/fiscal/cte57/xml` – gera XML simplificado (application/xml).
- `POST /api/fiscal/cte57/dacte/preview` – preview DACTE (HTML).
- `POST /api/fiscal/nfe55/authorize?sign=true&env=homologacao|producao` – envia XML para SEFAZ e persiste.
- `POST /api/fiscal/nfe55/consult?env=homologacao|producao` – consulta situação por chave/protocolo.
- `POST /api/fiscal/cte57/authorize?sign=true&env=homologacao|producao` – envia XML para SEFAZ e persiste.
- `POST /api/fiscal/cte57/consult?env=homologacao|producao` – consulta situação por chave/protocolo.
 - `POST /api/inventory/movements` – cria movimentação de estoque.
 - `GET /api/inventory/movements?productId=` – lista movimentos.
 - `GET /api/inventory/stock/:productId` – saldo de estoque.
 - `GET/POST /api/suppliers` – fornecedores.
 - `GET/POST /api/carriers` – transportadoras.
 - `POST /api/labels/barcode` – geração de dados de etiquetas (stub).

## Permissões
- Administrador: acesso completo, inclusive vendas de representantes e clientes
- Representante: acesso restrito, sem visão de lucros, vendas de outros reps ou clientes de terceiros

## Documentação Fiscal
- Consulte `docs/requisitos-fiscais.md` com os campos exigidos para NF-e (55) e CT-e (57).

## Próximos Passos
- Implementar autenticação e controle de acesso
- Criar módulos base de Clientes e Pedidos
- Iniciar emissão NF-e 55 e CT-e 57 (DACTE)

### Fiscal – NF-e 55 e CT-e 57 (validação, XML e preview)

As rotas fiscais executam validação básica do payload, geram XML simplificado e retornam pré-visualização HTML (DANFE/DACTE) para testes. Todas as rotas exigem autenticação via `x-api-key`.

Envios/consultas à SEFAZ usam um cliente SOAP genérico com URLs configuráveis para facilitar testes em homologação (ou com mocks). Em produção você deve apontar para os endpoints oficiais da sua UF e adequar SOAPAction/namespace conforme o provedor.

Variáveis de ambiente para SEFAZ:
- `SEFAZ_ENV` = `homologacao` (default) | `producao`
- NF-e 55:
  - `NFE_HML_AUTH_URL`, `NFE_PRD_AUTH_URL`
  - `NFE_HML_CONSULT_URL`, `NFE_PRD_CONSULT_URL`
  - `NFE_SOAP_ACTION_AUTH` (opcional), `NFE_SOAP_ACTION_CONSULT` (opcional)
- CT-e 57:
  - `CTE_HML_AUTH_URL`, `CTE_PRD_AUTH_URL`
  - `CTE_HML_CONSULT_URL`, `CTE_PRD_CONSULT_URL`
  - `CTE_SOAP_ACTION_AUTH` (opcional), `CTE_SOAP_ACTION_CONSULT` (opcional)

Observações:
- Use `?sign=true` para assinar o XML com certificado A1 configurado via `A1_PFX_PATH` e `A1_PFX_PASSWORD`.
- Você pode sobrepor o ambiente por requisição com `?env=homologacao|producao`.

Exemplos rápidos (PowerShell):

```
# Autorização NF-e (homologação) com assinatura
$env:SEFAZ_ENV = 'homologacao'
curl -Method POST http://localhost:3000/api/fiscal/nfe55/authorize?sign=true `
  -H 'Content-Type: application/json' `
  -H "x-api-key: $env:ADMIN_API_KEY" `
  -Body (Get-Content -Raw nfe.json) | Set-Content -Encoding utf8 nfe_autorizacao.json

# Consulta por chave/protocolo (NF-e)
@{ id = 'CHAVE_OU_PROTOCOLO_AQUI' } | ConvertTo-Json | `
  curl -Method POST http://localhost:3000/api/fiscal/nfe55/consult `
    -H 'Content-Type: application/json' `
    -H "x-api-key: $env:ADMIN_API_KEY" `
    -Body $input | Set-Content -Encoding utf8 nfe_consulta.json

# Autorização CT-e (produção) sem assinatura (somente teste)
curl -Method POST "http://localhost:3000/api/fiscal/cte57/authorize?env=producao" `
  -H 'Content-Type: application/json' `
  -H "x-api-key: $env:ADMIN_API_KEY" `
  -Body (Get-Content -Raw cte.json) | Set-Content -Encoding utf8 cte_autorizacao.json
```

- NF-e 55
  - POST `/api/fiscal/nfe55/validate` → `{ modelo: 55, valid, missing, errors }`
  - POST `/api/fiscal/nfe55/xml` → `application/xml` com o XML gerado
  - POST `/api/fiscal/nfe55/danfe/preview` → `text/html` com a prévia do DANFE

- CT-e 57
  - POST `/api/fiscal/cte57/validate` → `{ modelo: 57, valid, missing, errors }`
  - POST `/api/fiscal/cte57/xml` → `application/xml` com o XML gerado
  - POST `/api/fiscal/cte57/dacte/preview` → `text/html` com a prévia do DACTE

Assinatura A1 (opcional)
- Adicione `?sign=true` às rotas `/nfe55/xml` e `/cte57/xml` para assinar o XML com o certificado A1 (.pfx) configurado via `A1_PFX_PATH` e `A1_PFX_PASSWORD`.
- Exemplo (PowerShell):
```powershell
curl -Method POST "http://localhost:3000/api/fiscal/nfe55/xml?sign=true" `
  -H 'Content-Type: application/json' `
  -H "x-api-key: $env:ADMIN_API_KEY" `
  -Body (Get-Content -Raw nfe.json) > nfe-assinada.xml
```

Exemplos mínimos de payload

NF-e 55
```json
{
  "numero": "12345",
  "serie": "1",
  "emissao": "2025-01-01T10:00:00-03:00",
  "codigoAcesso": "12345678901234567890123456789012345678901234",
  "emitente": {"nome": "ACME LTDA", "cnpj": "12345678000199", "endereco": {}},
  "destinatario": {"nome": "CLIENTE SA", "documento": "98765432000188", "endereco": {}},
  "itens": [{"descricao": "Produto 1", "quantidade": 2, "unidade": "UN", "valorUnitario": 50, "cfop": "5102", "ncm": "12345678"}],
  "totais": {"totalProdutos": 100, "valorTotal": 100}
}
```

CT-e 57
```json
{
  "numero": "98765",
  "serie": "1",
  "dataHoraEmissao": "2025-01-01T11:00:00-03:00",
  "tipoEmissao": "Normal",
  "modal": "Rodoviário",
  "municipioInicio": "3550308",
  "municipioFim": "3304557",
  "tipoServico": "Normal",
  "emitente": {"nome": "TRANSPORTADORA XYZ", "documento": "11222333000144"},
  "tomador": {"nome": "CLIENTE SA", "documento": "98765432000188"},
  "chavesNFe": ["12345678901234567890123456789012345678901234"],
  "vPrest": 250.5,
  "componentes": [{"nome": "Frete", "valor": 250.5}]
}
```

Exemplos de uso (Windows/PowerShell)
```powershell
curl -Method POST http://localhost:3000/api/fiscal/nfe55/xml `
  -H 'Content-Type: application/json' `
  -H "x-api-key: $env:ADMIN_API_KEY" `
  -Body (Get-Content -Raw nfe.json) > nfe.xml

curl -Method POST http://localhost:3000/api/fiscal/cte57/dacte/preview `
  -H 'Content-Type: application/json' `
  -H "x-api-key: $env:ADMIN_API_KEY" `
  -Body (Get-Content -Raw cte.json) > dacte.html; start dacte.html
```