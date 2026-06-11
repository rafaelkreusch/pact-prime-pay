create extension if not exists pgcrypto;

create table if not exists public.negociacoes (
  id uuid primary key default gen_random_uuid(),
  devedor text not null,
  cnpj text not null,
  credor text not null,
  valor_avista numeric(12, 2),
  parcela_2x numeric(12, 2),
  parcela_3x numeric(12, 2),
  parcela_4x numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists negociacoes_cnpj_idx on public.negociacoes (cnpj);

create table if not exists public.acordos (
  id uuid primary key default gen_random_uuid(),
  negotiation_id uuid not null references public.negociacoes(id) on delete restrict,
  devedor text not null,
  cnpj text not null,
  credor text not null,
  tipo_acordo text not null,
  quantidade_parcelas integer not null,
  valor_parcela numeric(12, 2) not null,
  valor_total numeric(12, 2) not null,
  status text not null default 'processing_payment',
  asaas_customer_id text,
  asaas_payment_id text,
  invoice_url text,
  bank_slip_url text,
  pix_qr_code text,
  pix_copy_paste text,
  due_date date,
  raw_asaas_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists acordos_cnpj_idx on public.acordos (cnpj);
create index if not exists acordos_payment_idx on public.acordos (asaas_payment_id);

create table if not exists public.logs_integracao (
  id uuid primary key default gen_random_uuid(),
  origem text not null,
  evento text not null,
  status text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists negociacoes_set_updated_at on public.negociacoes;
create trigger negociacoes_set_updated_at
before update on public.negociacoes
for each row
execute function public.set_updated_at();

drop trigger if exists acordos_set_updated_at on public.acordos;
create trigger acordos_set_updated_at
before update on public.acordos
for each row
execute function public.set_updated_at();
