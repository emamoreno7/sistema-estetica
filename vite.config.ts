import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // VITE_BASE_PATH controla el subpath donde se sirve el sitio.
  // - Local / dev → "/" (default)
  // - GitHub Pages en subruta → "/Estetica-Gestion/"
  // - Dominio custom → "/"
  const basePath = process.env.VITE_BASE_PATH ?? "/";

  // VITE_SINGLE_FILE=1 activa el bundle todo-en-uno (útil para email
  // previews o distribución como un solo HTML). Desactivado por defecto
  // porque rompe el routing SPA y la carga de imágenes en /public.
  const singleFile = process.env.VITE_SINGLE_FILE === "1";

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      ...(singleFile ? [viteSingleFile()] : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    define: {
      __MODE__: JSON.stringify(mode),
    },
  };
});
