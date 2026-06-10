INSERT INTO auth.users (
  id, instance_id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
VALUES
  ('11111111-1111-1111-1111-111111111111',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'maria.demo@miestetica.com', '$2a$10$dummyhashnologinpossible', now(),
   '{"provider":"email"}'::jsonb, '{"full_name":"Maria Gonzalez"}'::jsonb,
   now() - interval '45 days', now()),

  ('22222222-2222-2222-2222-222222222222',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'lucia.demo@miestetica.com', '$2a$10$dummyhashnologinpossible', now(),
   '{"provider":"email"}'::jsonb, '{"full_name":"Lucia Fernandez"}'::jsonb,
   now() - interval '30 days', now()),

  ('33333333-3333-3333-3333-333333333333',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'carolina.demo@miestetica.com', '$2a$10$dummyhashnologinpossible', now(),
   '{"provider":"email"}'::jsonb, '{"full_name":"Carolina Lopez"}'::jsonb,
   now() - interval '20 days', now()),

  ('44444444-4444-4444-4444-444444444444',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'valentina.demo@miestetica.com', '$2a$10$dummyhashnologinpossible', now(),
   '{"provider":"email"}'::jsonb, '{"full_name":"Valentina Ruiz"}'::jsonb,
   now() - interval '10 days', now()),

  ('55555555-5555-5555-5555-555555555555',
   '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'camila.demo@miestetica.com', '$2a$10$dummyhashnologinpossible', now(),
   '{"provider":"email"}'::jsonb, '{"full_name":"Camila Torres"}'::jsonb,
   now() - interval '2 days', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.perfiles_clientes
  (id, full_name, phone, status, tratamiento_interes, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Maria Gonzalez',  '5491155551001', 'active',  'Radiofrecuencia',    now() - interval '45 days'),
  ('22222222-2222-2222-2222-222222222222', 'Lucia Fernandez', '5491155551002', 'active',  'Crio-lipolisis',     now() - interval '30 days'),
  ('33333333-3333-3333-3333-333333333333', 'Carolina Lopez',  '5491155551003', 'active',  'Body Up',            now() - interval '20 days'),
  ('44444444-4444-4444-4444-444444444444', 'Valentina Ruiz',  '5491155551004', 'active',  'Masajes relajantes', now() - interval '10 days'),
  ('55555555-5555-5555-5555-555555555555', 'Camila Torres',   '5491155551005', 'pending', 'Lipo-laser',         now() - interval '2 days')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  status = EXCLUDED.status,
  tratamiento_interes = EXCLUDED.tratamiento_interes;

INSERT INTO public.citas (id, cliente_id, servicio, fecha, hora, estado, created_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Radiofrecuencia',    CURRENT_DATE - 40, '10:00', 'confirmado', now() - interval '40 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Radiofrecuencia',    CURRENT_DATE - 33, '10:00', 'confirmado', now() - interval '33 days'),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Radiofrecuencia',    CURRENT_DATE - 26, '10:00', 'confirmado', now() - interval '26 days'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Crio-lipolisis',     CURRENT_DATE - 28, '14:00', 'confirmado', now() - interval '28 days'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Crio-lipolisis',     CURRENT_DATE - 21, '14:00', 'confirmado', now() - interval '21 days'),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Masajes relajantes', CURRENT_DATE - 14, '16:00', 'confirmado', now() - interval '14 days'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Body Up',            CURRENT_DATE - 18, '09:00', 'confirmado', now() - interval '18 days'),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Body Up',            CURRENT_DATE - 11, '09:00', 'confirmado', now() - interval '11 days'),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Masaje linfatico',   CURRENT_DATE - 7,  '11:00', 'confirmado', now() - interval '7 days')
ON CONFLICT DO NOTHING;

INSERT INTO public.citas (id, cliente_id, servicio, fecha, hora, estado, created_at)
VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Radiofrecuencia',    CURRENT_DATE + 2, '10:00', 'confirmado', now()),
  (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Crio-lipolisis',     CURRENT_DATE + 3, '14:00', 'pendiente',  now()),
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Body Up',            CURRENT_DATE + 4, '09:00', 'confirmado', now()),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Masajes relajantes', CURRENT_DATE + 1, '11:00', 'confirmado', now()),
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Presoterapia',       CURRENT_DATE + 5, '15:00', 'pendiente',  now())
ON CONFLICT DO NOTHING;

UPDATE public.perfiles_clientes pc
SET proxima_cita_at = sub.proxima
FROM (
  SELECT cliente_id, MIN(fecha + hora) AS proxima
  FROM public.citas
  WHERE fecha >= CURRENT_DATE
    AND estado IN ('confirmado', 'pendiente')
  GROUP BY cliente_id
) sub
WHERE pc.id = sub.cliente_id;
