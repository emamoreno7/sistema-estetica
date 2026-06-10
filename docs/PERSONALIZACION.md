# Personalizacion del sistema

Esta guia explica que archivos editar para adaptar el sistema a una estetica nueva.

## 1. Nombre del negocio y textos de marca

Archivo:
src/config/brand.ts

Aca se editan los textos visibles de marca, por ejemplo:

- businessName
- shortName
- backofficeName
- assistantName
- supportLabel
- memberSinceLabel
- clientFallbackName
- whatsappCtaLabel
- portalDataTitle
- copyrightName

## 2. Datos de contacto

Archivo:
src/config/contact.ts

Aca se editan:

- whatsapp
- phoneDisplay
- address
- instagram
- instagramUrl
- email
- hours
- siteUrl

## 3. Logo y favicon

Archivos en public/:

- public/logo.png - logo principal
- public/favicon.ico - icono del navegador
- public/favicon-192.png - icono PWA
- public/favicon-512.png - icono PWA splash

Para generar favicon desde un PNG:
https://favicon.io/favicon-converter/

## 4. Colores

El sistema usa Tailwind CSS v4.

Para encontrar todos los colores rose/pink hardcodeados en componentes:

grep -rn "rose-\|pink-\|fuchsia-" src/ --include="*.tsx" --include="*.ts"

Esos son los archivos donde cambiar el color si el cliente tiene una paleta diferente.

## 5. Servicios

Los servicios se gestionan desde Supabase, tabla servicios.

Para modificar el seed inicial editar:
supabase/migrations/010_seed_servicios_insumos.sql

## 6. Horarios

Los horarios visibles se editan en:
src/config/contact.ts campo hours

## 7. Resumen rapido

| Que            | Donde                          |
| Nombre         | src/config/brand.ts            |
| Contacto       | src/config/contact.ts          |
| Logo           | public/logo.png                |
| Favicon        | public/favicon.ico             |
| Colores        | clases Tailwind en componentes |
| Servicios      | Supabase tabla servicios       |
| Usuario admin  | Supabase Authentication        |
