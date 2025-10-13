# Arquitetura do Sistema (Português)

## Visão Geral
- Backend em **Node.js/Express** com **TypeScript**.
- Front-end web em **React** (responsivo) e aplicativo **React Native** (Android/iOS).
- Banco de dados **PostgreSQL**.
- Armazenamento de mídias (fotos e vídeos) em **S3** ou compatível.
- Autenticação via **JWT** e controle de acesso baseado em papéis (RBAC).

## Módulos
- Usuários e Permissões (Admin, Representante, Operador, Financeiro)
- CRM (Clientes, Agendas, Interações)
- Produtos (catálogo, fotos/vídeos, códigos de barras)
- Estoque (movimentações, inventário, prateleira)
- Vendas (pedidos, checkout, PDV, metas, equipe)
- Financeiro (contas a pagar/receber, fluxo de caixa, bancos)
- Fiscal (NF-e 55, NFC-e, CT-e 57, SPED, manifestação do destinatário)
- Integrações (Pagamentos, Marketplaces, Import/Export Excel)
- Relatórios (PDF/Excel)

## Padrões
- API RESTful com versionamento (`/api/v1/...`).
- Validação e schema com **Zod** ou **Joi**.
- Logs estruturados e auditoria (histórico de mudanças).
- Testes unitários e integração.

## Permissões
- Administrador: acesso total.
- Representante: acesso às próprias vendas e clientes vinculados; sem visão de lucros, sem acesso aos clientes/vendas de outros representantes.
- Financeiro: rotinas de contas e fluxo de caixa.

## Entidades Base
- Usuário, Papel, Permissão
- Cliente, Contato, Endereço
- Produto, Variação, Mídia
- Pedido, Item, Pagamento, Fatura, Nota Fiscal
- Transportadora, Veículo, Motorista
- Fornecedor, Empresa Representada
- Estoque, Movimentação, Depósito

## Próximos Passos
- Definir schema de banco de dados.
- Implementar autenticação e rotas básicas (Clientes/Pedidos).