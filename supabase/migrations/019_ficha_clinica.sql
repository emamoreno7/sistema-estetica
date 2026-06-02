-- ─────────────────────────────────────────────────────────────────────────
-- 019 — Ficha clínica de tratamiento (digitaliza la ficha en papel de Amore).
--
--   · fichas_clinicas   → anamnesis (cuestionario de salud) + plan + observaciones
--   · fichas_sesiones   → historial de sesiones (Nº · fecha · tratamiento · operador)
--
-- Requiere is_portal_admin() (migración 003).
-- ─────────────────────────────────────────────────────────────────────────

-- ── Ficha clínica (1 por cliente) ──────────────────────────────────────────
create table if not exists public.fichas_clinicas (
  cliente_id uuid primary key,
  -- Cuestionario de salud (anamnesis). boolean NULL = sin responder.
  toma_liquido boolean,
  toma_anticonceptivos boolean,
  periodos_regulares boolean,
  fuma boolean,
  menopausia boolean,
  actividad_fisica boolean,
  -- Antecedentes (texto libre)
  intervenciones_quirurgicas text,
  hijos text,
  medicamentos text,
  alergias text,
  observaciones text,
  -- Plan: "su tratamiento comprende…"
  tratamiento_comprende text,
  -- Metadata
  updated_at timestamptz not null default now(),
  updated_por_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.fichas_clinicas enable row level security;

drop policy if exists "ficha_select_own" on public.fichas_clinicas;
create policy "ficha_select_own"
  on public.fichas_clinicas for select to authenticated
  using (auth.uid() = cliente_id);

drop policy if exists "ficha_insert_own" on public.fichas_clinicas;
create policy "ficha_insert_own"
  on public.fichas_clinicas for insert to authenticated
  with check (auth.uid() = cliente_id);

drop policy if exists "ficha_update_own" on public.fichas_clinicas;
create policy "ficha_update_own"
  on public.fichas_clinicas for update to authenticated
  using (auth.uid() = cliente_id) with check (auth.uid() = cliente_id);

drop policy if exists "ficha_admin_all" on public.fichas_clinicas;
create policy "ficha_admin_all"
  on public.fichas_clinicas for all to authenticated
  using (public.is_portal_admin()) with check (public.is_portal_admin());

comment on table public.fichas_clinicas is
  'Ficha clínica del cliente: anamnesis, antecedentes y plan de tratamiento.';

-- ── Sesiones realizadas (historial de tratamientos) ────────────────────────
create table if not exists public.fichas_sesiones (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null,
  nro integer,
  fecha date,
  tratamiento text,
  operador text,
  notas text,
  created_at timestamptz not null default now()
);

create index if not exists fichas_sesiones_cliente_idx
  on public.fichas_sesiones (cliente_id, fecha);

alter table public.fichas_sesiones enable row level security;

-- Cliente: solo lee su historial
drop policy if exists "sesiones_select_own" on public.fichas_sesiones;
create policy "sesiones_select_own"
  on public.fichas_sesiones for select to authenticated
  using (auth.uid() = cliente_id);

-- Admin: gestiona el historial (alta/edición/baja)
drop policy if exists "sesiones_admin_all" on public.fichas_sesiones;
create policy "sesiones_admin_all"
  on public.fichas_sesiones for all to authenticated
  using (public.is_portal_admin()) with check (public.is_portal_admin());

comment on table public.fichas_sesiones is
  'Historial de sesiones realizadas (Nº, fecha, tratamiento, operador).';
