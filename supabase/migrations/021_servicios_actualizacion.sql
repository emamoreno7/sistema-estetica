-- ─────────────────────────────────────────────────────────────────────────
-- 021 — Actualización del catálogo de servicios reales de Amore.
--
--  • Elimina HIMU del sistema (no se ofrece).
--  • Elimina servicios que ya no se ofrecen: "Masajes descontracturantes" y
--    "Laminado de pestañas".
--  • Agrega: Hollywood Peel, Laminado de cejas (Facial & Mirada),
--    Belleza de manos y Nails (uñas) en la nueva categoría "Manos & Uñas".
--
-- Idempotente: los inserts se hacen con NOT EXISTS (no dependen de una
-- restricción única, que puede no existir en instalaciones viejas).
-- ─────────────────────────────────────────────────────────────────────────

-- 1) Alta de servicios nuevos (precio 0 hasta definirlo en /admin/costos)
insert into public.servicios
  (categoria_id, categoria_label, nombre, precio, duracion_minutos, descripcion, activo, imagen_url, badges, sort_order)
select 'facial', 'Facial & Mirada', 'Hollywood Peel', 0, 45,
       'Peeling de carbón con láser para una piel luminosa y unificada: reduce poros, opacidad y textura con un acabado fresco y radiante.',
       true, '/pestanas.png', array['Facial']::text[], 11
where not exists (
  select 1 from public.servicios where categoria_id = 'facial' and nombre = 'Hollywood Peel'
);

insert into public.servicios
  (categoria_id, categoria_label, nombre, precio, duracion_minutos, descripcion, activo, imagen_url, badges, sort_order)
select 'facial', 'Facial & Mirada', 'Laminado de cejas', 0, 45,
       'Cejas peinadas, fijadas y con forma definida durante semanas: efecto prolijo y voluminoso que enmarca la mirada.',
       true, '/pestanas.png', array['Lashista']::text[], 12
where not exists (
  select 1 from public.servicios where categoria_id = 'facial' and nombre = 'Laminado de cejas'
);

insert into public.servicios
  (categoria_id, categoria_label, nombre, precio, duracion_minutos, descripcion, activo, imagen_url, badges, sort_order)
select 'manos', 'Manos & Uñas', 'Belleza de manos', 0, 45,
       'Cuidado completo de manos: prolijado de cutículas, hidratación y esmaltado para manos prolijas y cuidadas.',
       true, '/pestanas.png', array['Manicura']::text[], 16
where not exists (
  select 1 from public.servicios where categoria_id = 'manos' and nombre = 'Belleza de manos'
);

insert into public.servicios
  (categoria_id, categoria_label, nombre, precio, duracion_minutos, descripcion, activo, imagen_url, badges, sort_order)
select 'manos', 'Manos & Uñas', 'Nails (uñas)', 0, 60,
       'Servicio de uñas: esculpidas, semipermanente o kapping, con diseño y terminación profesional a tu estilo.',
       true, '/pestanas.png', array['Uñas']::text[], 17
where not exists (
  select 1 from public.servicios where categoria_id = 'manos' and nombre = 'Nails (uñas)'
);

-- 2) Baja de servicios no ofrecidos + HIMU (primero sus vínculos de insumos)
delete from public.servicios_insumos
where servicio_id in (
  select id from public.servicios
  where nombre in ('Masajes descontracturantes', 'Laminado de pestañas')
     or nombre ilike 'himu%'
);

delete from public.servicios
where nombre in ('Masajes descontracturantes', 'Laminado de pestañas')
   or nombre ilike 'himu%';
