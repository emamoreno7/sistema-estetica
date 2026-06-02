-- ─────────────────────────────────────────────────────────────────────────
-- 018 — Consentimiento informado obligatorio para realizar tratamientos.
--
-- El cliente firma (acepta) digitalmente una declaración antes de poder
-- solicitar turnos. El admin ve el estado reflejado en la ficha del cliente.
--
-- Requiere is_portal_admin() (migración 003).
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists public.consentimientos_clientes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null,
  -- Datos de la firma
  nombre_firma text not null,
  dni text,
  -- Declaraciones aceptadas (todas obligatorias para considerarse firmado)
  declara_salud boolean not null default false,
  acepta_tratamiento boolean not null default false,
  acepta_datos boolean not null default false,
  -- Contraindicaciones / observaciones declaradas por el cliente
  contraindicaciones text,
  -- Versión del texto legal aceptado (permite re-firmar si cambia)
  version text not null default 'v1',
  -- Metadata
  firmado_at timestamptz not null default now(),
  user_agent text,
  -- true si lo cargó recepción/admin en nombre del cliente
  firmado_por_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Un consentimiento vigente por cliente (re-firmar = upsert sobre esta fila)
create unique index if not exists consentimientos_cliente_uidx
  on public.consentimientos_clientes (cliente_id);

create index if not exists consentimientos_firmado_idx
  on public.consentimientos_clientes (firmado_at);

alter table public.consentimientos_clientes enable row level security;

-- Cliente: inserta / lee / actualiza SU propio consentimiento
drop policy if exists "consent_insert_own" on public.consentimientos_clientes;
create policy "consent_insert_own"
  on public.consentimientos_clientes
  for insert
  to authenticated
  with check (auth.uid() = cliente_id);

drop policy if exists "consent_select_own" on public.consentimientos_clientes;
create policy "consent_select_own"
  on public.consentimientos_clientes
  for select
  to authenticated
  using (auth.uid() = cliente_id);

drop policy if exists "consent_update_own" on public.consentimientos_clientes;
create policy "consent_update_own"
  on public.consentimientos_clientes
  for update
  to authenticated
  using (auth.uid() = cliente_id)
  with check (auth.uid() = cliente_id);

-- Admin: lee todos, inserta/actualiza (para clientes walk-in cargados en recepción)
drop policy if exists "consent_admin_select" on public.consentimientos_clientes;
create policy "consent_admin_select"
  on public.consentimientos_clientes
  for select
  to authenticated
  using (public.is_portal_admin());

drop policy if exists "consent_admin_insert" on public.consentimientos_clientes;
create policy "consent_admin_insert"
  on public.consentimientos_clientes
  for insert
  to authenticated
  with check (public.is_portal_admin());

drop policy if exists "consent_admin_update" on public.consentimientos_clientes;
create policy "consent_admin_update"
  on public.consentimientos_clientes
  for update
  to authenticated
  using (public.is_portal_admin())
  with check (public.is_portal_admin());

comment on table public.consentimientos_clientes is
  'Consentimiento informado firmado por el cliente antes de realizar tratamientos.';
