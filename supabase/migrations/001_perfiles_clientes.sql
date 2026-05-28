-- Ejecutá este SQL en el SQL Editor de Supabase (o como migración).
-- Crea la tabla de perfiles vinculada a auth.users.
-- Convención de columnas: full_name / phone (alineadas con el front React).

create table if not exists public.perfiles_clientes (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text not null,
  tratamiento_interes text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.perfiles_clientes enable row level security;

create policy "perfiles_select_own"
  on public.perfiles_clientes
  for select
  using (auth.uid() = id);

create policy "perfiles_insert_own"
  on public.perfiles_clientes
  for insert
  with check (auth.uid() = id);

create policy "perfiles_update_own"
  on public.perfiles_clientes
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create index if not exists perfiles_clientes_phone_idx
  on public.perfiles_clientes (phone);
