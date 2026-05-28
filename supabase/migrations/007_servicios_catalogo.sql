-- Catálogo de servicios (Supabase) — lectura pública de filas activas; gestión vía is_portal_admin().

create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  categoria_id text not null,
  categoria_label text not null,
  nombre text not null,
  precio numeric(12, 2) not null default 0,
  duracion_minutos int not null default 60,
  descripcion text not null default '',
  activo boolean not null default true,
  imagen_url text not null default '/body-up.png',
  badges text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (categoria_id, nombre)
);

create index if not exists servicios_activo_idx on public.servicios (activo);
create index if not exists servicios_categoria_sort_idx on public.servicios (categoria_id, sort_order);

comment on table public.servicios is 'Catálogo Amore — sincronizado con la web y el panel admin';

alter table public.servicios enable row level security;

drop policy if exists "servicios_select_activos" on public.servicios;
create policy "servicios_select_activos"
  on public.servicios
  for select
  using (activo = true);

drop policy if exists "servicios_admin_all" on public.servicios;
create policy "servicios_admin_all"
  on public.servicios
  for all
  to authenticated
  using (public.is_portal_admin())
  with check (public.is_portal_admin());

-- Datos iniciales (precio 0 hasta definir en panel)
insert into public.servicios (categoria_id, categoria_label, nombre, precio, duracion_minutos, descripcion, activo, imagen_url, badges, sort_order) values
('corporal', 'Remodelación Corporal', 'Body Up', 0, 60,
 'Modelado corporal con protocolo Amore: tonificación y contorno con la serenidad de un ritual de belleza, no de un gimnasio.',
 true, '/body-up.png', array['Tonificador','Reductor']::text[], 1),
('corporal', 'Remodelación Corporal', 'Radiofrecuencia', 0, 60,
 'Firmeza y luminosidad: estimulación del colágeno para una piel más compacta, con la calma y la precisión que tu cuerpo merece.',
 true, '/radiofrecuencia.png', array['Reafirmante']::text[], 2),
('corporal', 'Remodelación Corporal', 'Crio-lipólisis', 0, 60,
 'Enfriamiento controlado sobre zonas localizadas, en un entorno clínico impecable y acogedor. Sin prisas, solo resultados bien acompañados.',
 true, '/crio.png', array['Reductor']::text[], 3),
('corporal', 'Remodelación Corporal', 'Lipo-láser', 0, 60,
 'Tecnología láser para acompañar tu silueta con contornos más definidos, siempre dentro de un cuidado personalizado Amore.',
 true, '/lipolaser.png', array['Reductor']::text[], 4),
('corporal', 'Remodelación Corporal', 'Electrodos', 0, 60,
 'Activación muscular profunda para tonificar y drenar, con sensación de bienestar y sin perder la elegancia del momento.',
 true, '/electrodo.png', array['Tonificador','Drenante']::text[], 5),

('bienestar', 'Bienestar', 'Masajes relajantes', 0, 60,
 'Ritual de descanso con movimientos lentos y aceites seleccionados. Tu cuerpo baja el ritmo; tu mente, también.',
 true, '/masajesr.png', array['Relajante']::text[], 6),
('bienestar', 'Bienestar', 'Masajes descontracturantes', 0, 60,
 'Liberación de tensiones acumuladas con técnica experta. Profundo cuando hace falta, siempre respetuoso con tu comodidad.',
 true, '/masajesi.png', array['Terapéutico']::text[], 7),
('bienestar', 'Bienestar', 'Masaje linfático', 0, 60,
 'Drenaje suave y rítmico que favorece la circulación y la sensación de ligereza, en un espacio pensado para tu bienestar.',
 true, '/masajesl.png', array['Drenante']::text[], 8),
('bienestar', 'Bienestar', 'Presoterapia', 0, 60,
 'Compresión secuencial envolvente para activar la circulación y la sensación de piernas descansadas y definidas.',
 true, '/presoterapia.png', array['Drenante','Reafirmante']::text[], 9),
('bienestar', 'Bienestar', 'Piedras calientes', 0, 60,
 'Calor volcanic sobre la piel que relaja la fibra muscular hasta lo más profundo. Un clásico del spa, elevado al estándar Amore.',
 true, '/piedras-calientes.png', array['Relajante']::text[], 10),

('facial', 'Facial & Mirada', 'Lifting de pestañas', 0, 60,
 'Curva y elevación natural: una mirada despierta y femenina sin el peso de las extensiones, con acabado limpio y duradero.',
 true, '/pestanas.png', array['Lashista']::text[], 11),
('facial', 'Facial & Mirada', 'Laminado de pestañas', 0, 60,
 'Nutre y ordena la fibra capilar para un efecto maquillado suave y ordenado, con brillo saludable y sensación ligera.',
 true, '/pestanas.png', array['Lashista']::text[], 12),
('facial', 'Facial & Mirada', 'Perfilado de cejas', 0, 60,
 'Diseño a medida que equilibra simetría y expresión: cejas que enmarcan sin competir con tu rostro.',
 true, '/pestanas.png', array['Lashista']::text[], 13),

('especialidades', 'Especialidades', 'Depilación definitiva', 0, 60,
 'Piel lisa y cuidada en el tiempo, con tecnología y seguimiento profesional. Cada sesión avanza hacia tu comodidad y confianza.',
 true, '/depilacion.png', array['Definitivo']::text[], 14),
('especialidades', 'Especialidades', 'Eliminación de tatuajes', 0, 60,
 'Protocolo láser Neatcell con enfoque en seguridad y resultados progresivos. Piel acompañada, información clara, en cada paso.',
 true, '/tatuajes.png', array['Especialidad']::text[], 15)
on conflict (categoria_id, nombre) do nothing;

grant select on public.servicios to anon, authenticated;
grant insert, update, delete on public.servicios to authenticated;
