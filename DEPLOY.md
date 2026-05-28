# Deploy a GitHub Pages

El repo está configurado para publicarse automáticamente en GitHub Pages
cada vez que se hace push a `main`. La URL final será:

```
https://emamoreno7.github.io/Estetica-Gestion/
```

## 1. Configurar Pages en el repo

1. Ir a **Settings → Pages**.
2. En **Build and deployment → Source** elegir **GitHub Actions**.
   (NO usar "Deploy from a branch" — usamos el workflow propio.)

## 2. Configurar los Secrets

Settings → **Secrets and variables → Actions** → *New repository secret*.
Agregar uno por uno:

| Nombre                   | Valor                                           |
| ------------------------ | ----------------------------------------------- |
| `VITE_SUPABASE_URL`      | `https://atbbbhpbexrtnlbvvzjb.supabase.co`      |
| `VITE_SUPABASE_ANON_KEY` | la `anon key` de Supabase                       |
| `VITE_ADMIN_EMAILS`      | `emamoreno@icloud.com,ailencarro29@gmail.com`   |
| `VITE_ADMIN_USER_IDS`    | `fbb118cc-d349-4e4b-8795-911d3b314f56`          |

> Las variables `VITE_*` se inyectan en el bundle del cliente: son
> visibles en el JS final. Eso está bien para la `anon key` de Supabase
> (es pública por diseño — RLS protege los datos). **Nunca** pongas la
> `service_role` key acá.

## 3. Agregar la URL de Pages a Supabase

Si usás Auth con OAuth o magic links, en
**Supabase Dashboard → Authentication → URL Configuration**
agregá a *Redirect URLs*:

```
https://emamoreno7.github.io/Estetica-Gestion/
https://emamoreno7.github.io/Estetica-Gestion/*
```

## 4. Disparar el deploy

Cualquier push a `main` lanza el workflow `.github/workflows/deploy-pages.yml`.
También se puede ejecutar manualmente desde la pestaña **Actions** del
repo (botón **Run workflow** sobre *Deploy to GitHub Pages*).

El sitio queda disponible en pocos minutos en
`https://emamoreno7.github.io/Estetica-Gestion/`.

## 5. Probar el build localmente antes de pushear

```bash
npm run preview:pages
```

Esto compila con el mismo `base` que usa Pages y levanta un preview en
`http://localhost:4173/Estetica-Gestion/`. Útil para validar que el
routing y las imágenes cargan bien antes del push.

## Notas técnicas

- **Routing SPA**: GitHub Pages no hace rewrites. Para que `/admin`,
  `/portal`, etc. funcionen al recargar o entrar por link directo,
  `public/404.html` toma cualquier 404 y redirige a `index.html?/ruta`;
  un script en `index.html` reconstruye la URL real antes de que React
  Router se monte.
- **Base path**: `VITE_BASE_PATH=/Estetica-Gestion/` se setea en el
  workflow. En desarrollo local sigue siendo `/`.
- **Single file build**: el plugin `vite-plugin-singlefile` ahora es
  opcional (`VITE_SINGLE_FILE=1`). Quedó disponible vía
  `npm run build:singlefile` para distribuir el preview como un solo
  HTML, pero NO se usa para Pages (rompería el routing).
- **Mover a dominio custom**: si después configurás un dominio propio
  (ej. `amore.com.ar`), el `base` debe volver a `/`. Cambialo en el
  workflow (`VITE_BASE_PATH: /`) y en `public/404.html` cambiá
  `segmentCount = 0`.
