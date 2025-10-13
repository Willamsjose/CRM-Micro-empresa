-- Tabelas essenciais (clientes, pedidos, produtos, estoque, fornecedores, transportadoras, fiscais)

create table if not exists customers (
  id text primary key,
  name text not null,
  document text,
  address jsonb,
  representative_id text,
  created_at timestamptz default now()
);

create table if not exists orders (
  id text primary key,
  customer_id text references customers(id),
  items jsonb not null default '[]',
  total numeric not null default 0,
  representative_id text,
  status text not null default 'aberto',
  created_at timestamptz default now()
);

create table if not exists products (
  id text primary key,
  name text not null,
  sku text,
  price numeric not null default 0,
  barcode text,
  media jsonb,
  representative_id text,
  created_at timestamptz default now()
);

create table if not exists inventory_movements (
  id text primary key,
  product_id text references products(id),
  type text not null check (type in ('entrada','saida','ajuste')),
  quantity numeric not null,
  reason text,
  representative_id text,
  created_at timestamptz default now()
);

create table if not exists suppliers (
  id text primary key,
  name text not null,
  cnpj text,
  ie text,
  address jsonb,
  representative_id text,
  created_at timestamptz default now()
);

create table if not exists carriers (
  id text primary key,
  name text not null,
  cnpj text,
  ie text,
  rntrc text,
  address jsonb,
  vehicle jsonb,
  driver jsonb,
  representative_id text,
  created_at timestamptz default now()
);

-- Fiscais (simplificados para desenvolvimento)
create table if not exists nfe55 (
  id text primary key,
  numero text,
  serie text,
  emissao timestamptz,
  codigo_acesso text,
  emitente jsonb,
  destinatario jsonb,
  itens jsonb,
  totais jsonb,
  transporte jsonb,
  adicionais jsonb,
  xml text,
  status text,
  protocolo text,
  created_at timestamptz default now()
);

create table if not exists cte57 (
  id text primary key,
  numero text,
  serie text,
  data_hora_emissao timestamptz,
  tipo_emissao text,
  modal text,
  municipio_inicio text,
  municipio_fim text,
  tipo_servico text,
  emitente jsonb,
  tomador jsonb,
  remetente jsonb,
  destinatario jsonb,
  chaves_nfe jsonb,
  vprest numeric,
  componentes jsonb,
  cst text,
  icms jsonb,
  rntrc text,
  veiculo jsonb,
  motorista jsonb,
  observacoes text,
  xml text,
  status text,
  protocolo text,
  created_at timestamptz default now()
);