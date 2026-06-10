# Sistema de Gestion para Centros de Estetica

Sistema web completo para gestion de turnos, clientes, servicios
y metricas de rentabilidad para centros de estetica.

Un proyecto Supabase y un deploy Vercel por cliente.

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth + RLS)
- Vercel (deploy)

## Quick Start

### 1. Clonar el repo

git clone https://github.com/tu-usuario/sistema-estetica.git
cd sistema-estetica

### 2. Instalar dependencias

npm install

### 3. Variables de entorno

cp .env.example .env.local

Editar .env.local con credenciales de Supabase del cliente.

### 4. Base de datos

Correr las 20 migraciones en orden en Supabase SQL Editor.
Ver: docs/SETUP-NUEVO-CLIENTE.md

### 5. Dev server

npm run dev

## Scripts

npm run dev         - servidor de desarrollo
npm run build       - build de produccion
npm run typecheck   - verificar tipos TypeScript

## Documentacion

- docs/SETUP-NUEVO-CLIENTE.md  guia de instalacion para cliente nuevo
- docs/PERSONALIZACION.md      que editar para personalizar el sistema

## Variables de entorno requeridas

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_ADMIN_EMAILS
