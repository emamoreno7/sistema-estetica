-- ─────────────────────────────────────────────────────────────────────────
-- 020 — Agrega fecha de nacimiento al consentimiento informado.
--
-- DNI, fecha de nacimiento y nombre completo pasan a ser obligatorios en la
-- firma del cliente (validación en la app). Acá solo sumamos la columna.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.consentimientos_clientes
  add column if not exists fecha_nacimiento date;

comment on column public.consentimientos_clientes.fecha_nacimiento is
  'Fecha de nacimiento declarada por el cliente al firmar el consentimiento.';
