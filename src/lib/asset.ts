/**
 * Helper para resolver paths a archivos en /public respetando el `base`
 * configurado en Vite (ej. `/Estetica-Gestion/` en GitHub Pages).
 *
 * Vite NO reescribe paths absolutos hardcodeados en strings JSX
 * como `<img src="/logo.png" />`, por eso necesitamos componer la URL
 * a mano con `import.meta.env.BASE_URL`.
 *
 * Acepta tanto `'/logo.png'` como `'logo.png'`, y deja URLs absolutas
 * (`http://`, `data:`, `blob:`) sin tocar.
 */
export function asset(path: string): string {
  if (!path) return path;
  // URL absoluta o data URI — devolver tal cual
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  // BASE_URL siempre tiene trailing slash ('/'), quitamos el leading
  // del path para evitar dobles barras
  const base = import.meta.env.BASE_URL;
  return base + path.replace(/^\//, '');
}
