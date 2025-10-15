-- Tabelas essenciais (clientes, pedidos, produtos, estoque, fornecedores, transportadoras, fiscais)

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  document text unique,
  address jsonb,
  representative_id text,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  items jsonb not null default '[]',
  total numeric not null default 0,
  representative_id text,
  status text not null default 'aberto',
  created_at timestamptz default now()
);
create index if not exists idx_orders_customer_id on orders(customer_id);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text unique,
  price numeric not null default 0,
  barcode text unique,
  media jsonb,
  representative_id text,
  created_at timestamptz default now()
);

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  type text not null check (type in ('entrada','saida','ajuste')),
  quantity numeric not null,
  reason text,
  representative_id text,
  created_at timestamptz default now()
);
create index if not exists idx_inventory_movements_product_id on inventory_movements(product_id);

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text unique,
  ie text,
  address jsonb,
  representative_id text,
  created_at timestamptz default now()
);

create table if not exists carriers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cnpj text unique,
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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
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