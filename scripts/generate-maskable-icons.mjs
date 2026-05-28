/**
 * Usa public/apple-touch-icon.png como imagen maestra (la que subís / reemplazás).
 * Regenera iconos PWA con zona segura ~80% sobre fondo #fdf8f5.
 *
 * Ejecutar: npx --yes -p sharp node scripts/generate-maskable-icons.mjs
 */
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sourcePath = join(root, 'public', 'apple-touch-icon.png');
const BG = { r: 253, g: 248, b: 245, alpha: 1 }; // manifest background_color

const pngOpts = {
  compressionLevel: 9,
  adaptiveFiltering: true,
  effort: 10,
};

async function makeIcon(masterBuf, size, outRel, scale = 0.8) {
  const inner = Math.round(size * scale);
  const logoBuf = await sharp(masterBuf)
    .resize(inner, inner, { fit: 'inside', withoutEnlargement: false })
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png(pngOpts)
    .toFile(join(root, 'public', outRel));

  console.log('wrote', outRel);
}

const masterBuf = await readFile(sourcePath);

await makeIcon(masterBuf, 180, 'apple-touch-icon.png');
await makeIcon(masterBuf, 192, 'icon-192.png');
await makeIcon(masterBuf, 512, 'icon-512.png');
await makeIcon(masterBuf, 192, 'icon-maskable-192.png');
await makeIcon(masterBuf, 512, 'icon-maskable-512.png');
