# Setup nuevo cliente

Esta guia explica como instalar el sistema para una estetica nueva.

## Requisitos previos

- Node.js 18+
- Acceso al repo en GitHub
- Cuenta en Supabase
- Cuenta en Vercel
- Datos del cliente: nombre, telefono, Instagram, direccion, email, horarios

## Paso 1 - Crear proyecto Supabase

1. Entrar a https://supabase.com/dashboard
2. Click en "New project"
3. Nombre sugerido: estetica-nombre-cliente
4. Elegir region South America (Sao Paulo)
5. Guardar la password de base de datos
6. Esperar a que termine de crear el proyecto

Luego copiar desde Project Settings > API:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Paso 2 - Correr migraciones

Correr en Supabase SQL Editor, en orden:

- 001_perfiles_clientes.sql
- 003_admin_proxima_cita.sql
- 004_perfiles_canonical_columns_and_trigger.sql
- 005_citas.sql
- 006_citas_estados_admin_rls.sql
- 007_servicios_catalogo.sql
- 008_costos_operativos.sql
- 009_seed_costos_insumos.sql
- 010_seed_servicios_insumos.sql
- 011_auditoria_precios_insumos.sql
- 012_touch_updated_at_triggers.sql
- 013_cantidad_estimada_mensual.sql
- 014_sondeo_precios.sql
- 015_sondeo_cron_semanal.sql
- 016_citas_admin_insert_y_notas.sql
- 017_clientes_walkin.sql
- 018_consentimientos.sql
- 019_ficha_clinica.sql
- 020_consentimiento_fecha_nac.sql
- 021_servicios_actualizacion.sql

## Paso 3 - Correr script de trigger

En Supabase SQL Editor, ejecutar el contenido de:
scripts/fix-trigger-generic.sql

## Paso 4 - Crear usuario admin

1. Ir a Authentication > Users en Supabase
2. Click en "Add user" > "Create new user"
3. Completar email y password del admin del cliente
4. Marcar "Auto Confirm User"
5. Click en "Create user"

Luego ejecutar en SQL Editor:

UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@elcliente.com';

## Paso 5 - Editar brand.ts

Editar src/config/brand.ts con los datos del cliente:

businessName: nombre completo del negocio
shortName: nombre corto para el header
backofficeName: titulo del backoffice
assistantName: nombre del asistente
supportLabel: nombre para mensajes de soporte
memberSinceLabel: mensaje de bienvenida
clientFallbackName: nombre generico de cliente
whatsappCtaLabel: texto del boton WhatsApp
portalDataTitle: titulo en portal de clientes
copyrightName: nombre en el pie de pagina

## Paso 6 - Editar contact.ts

Editar src/config/contact.ts con los datos del cliente:

whatsapp: numero sin espacios, formato 54 + 9 + area + numero
phoneDisplay: numero formateado para mostrar al usuario
address: direccion completa
instagram: handle sin arroba
instagramUrl: URL completa de Instagram
email: email de contacto
hours: horarios de atencion
siteUrl: URL del sitio web del cliente

## Paso 7 - Reemplazar logo y favicon

Colocar los archivos del cliente en public/:

- public/logo.png - logo principal, PNG con fondo transparente
- public/favicon.ico - icono del navegador
- public/favicon-192.png - icono PWA 192x192
- public/favicon-512.png - icono PWA 512x512

Si el cliente no tiene favicon, se puede generar a partir del logo.

## Paso 8 - Configurar variables de entorno locales

Copiar el archivo de ejemplo:

cp .env.example .env.local

Editar .env.local con las credenciales del Paso 1:

VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_ADMIN_EMAILS=admin@elcliente.com

Verificar que el build funciona:

npm run build

## Paso 9 - Configurar Supabase Auth para produccion

En Supabase ir a Authentication > URL Configuration

Configurar:

- Site URL: https://tu-deploy.vercel.app
- Redirect URLs:
  - https://tu-deploy.vercel.app/**
  - http://localhost:5173/**

## Paso 10 - Deploy en Vercel

1. Ir a https://vercel.com/new
2. Importar el repo sistema-estetica
3. Crear un proyecto nuevo para ese cliente
4. Agregar variables de entorno:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_ADMIN_EMAILS
5. Hacer click en Deploy

La URL final sera algo como:
https://estetica-cliente.vercel.app

## Paso 11 - Verificar login

1. Abrir la URL del deploy
2. Hacer login con el email y password del admin del Paso 4
3. Verificar que:
   - El login funciona sin errores
   - El dashboard carga correctamente
   - El nombre del negocio es el del cliente
   - Los datos de contacto son los del cliente

## Checklist final

- [ ] Proyecto Supabase creado
- [ ] 20 migraciones corridas en orden sin errores
- [ ] fix-trigger-generic.sql ejecutado
- [ ] Usuario admin creado con role admin en profiles
- [ ] brand.ts actualizado
- [ ] contact.ts actualizado
- [ ] Logo y favicon reemplazados
- [ ] .env.local configurado y build pasa
- [ ] Supabase Auth URLs configuradas
- [ ] Variables de entorno cargadas en Vercel
- [ ] Deploy exitoso
- [ ] Login admin verificado en produccion
