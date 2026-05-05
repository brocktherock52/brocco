/**
 * Strip the dark background from public/assets/brocco-mark.png and write a
 * transparent-PNG version. Flood-fills from every edge pixel so we only
 * remove dark pixels CONNECTED to the canvas border. Interior dark detail
 * (eye dot, nostrils, mouth, belly ripples) is preserved.
 *
 * Also writes Next.js convention favicon assets:
 *   - app/icon.png        (auto-served as /icon.png — favicon)
 *   - app/apple-icon.png  (auto-served as /apple-icon.png)
 */
import sharp from 'sharp';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'public/assets/brocco-mark.png');
const DST_TRANSPARENT = path.join(ROOT, 'public/assets/brocco-mark-transparent.png');
const DST_APP_ICON = path.join(ROOT, 'app/icon.png');
const DST_APPLE_ICON = path.join(ROOT, 'app/apple-icon.png');
const DST_PWA_512 = path.join(ROOT, 'public/assets/icon-512.png');
const DST_PWA_192 = path.join(ROOT, 'public/assets/icon-192.png');
const DST_PWA_512_MASKED = path.join(ROOT, 'public/assets/icon-512-maskable.png');
const DST_PWA_192_MASKED = path.join(ROOT, 'public/assets/icon-192-maskable.png');

// luma threshold: pixels with avg(r,g,b) below this count as "dark"
const DARK_THRESHOLD = 30;

async function makeTransparent(input, outputPath) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const total = width * height;

  const isDark = (i) => {
    const off = i * 4;
    return (data[off] + data[off + 1] + data[off + 2]) / 3 < DARK_THRESHOLD;
  };

  // visited flag = 1 if proven background (connected to edge)
  const bg = new Uint8Array(total);
  // stack-based flood fill (DFS) from every edge pixel
  const stack = [];
  function pushIfDarkAndUnseen(i) {
    if (i < 0 || i >= total) return;
    if (bg[i]) return;
    if (!isDark(i)) return;
    bg[i] = 1;
    stack.push(i);
  }
  for (let x = 0; x < width; x++) {
    pushIfDarkAndUnseen(x);                 // top row
    pushIfDarkAndUnseen((height - 1) * width + x); // bottom row
  }
  for (let y = 0; y < height; y++) {
    pushIfDarkAndUnseen(y * width);             // left col
    pushIfDarkAndUnseen(y * width + width - 1); // right col
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % width;
    const y = (i / width) | 0;
    if (x > 0) pushIfDarkAndUnseen(i - 1);
    if (x < width - 1) pushIfDarkAndUnseen(i + 1);
    if (y > 0) pushIfDarkAndUnseen(i - width);
    if (y < height - 1) pushIfDarkAndUnseen(i + width);
  }

  // alpha-zero the connected background region only
  for (let i = 0; i < total; i++) {
    if (bg[i]) {
      data[i * 4 + 3] = 0;
    }
  }

  await sharp(data, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function squarePadAndResize(input, size, outputPath, padPct = 0) {
  // trim to bbox, center on transparent square, resize to `size`.
  const trimmed = await sharp(input).trim({ threshold: 5 }).png().toBuffer();
  const meta = await sharp(trimmed).metadata();
  const w = meta.width ?? size;
  const h = meta.height ?? size;
  const longest = Math.max(w, h);
  const padding = Math.round(longest * padPct);
  const canvasSide = longest + padding * 2;
  const padX = Math.round((canvasSide - w) / 2);
  const padY = Math.round((canvasSide - h) / 2);

  await sharp(trimmed)
    .extend({
      top: padY,
      bottom: canvasSide - h - padY,
      left: padX,
      right: canvasSide - w - padX,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}

async function main() {
  await fs.access(SRC).catch(() => {
    throw new Error(`source not found: ${SRC}`);
  });

  console.log('[1/5] flood-fill transparent PNG ->', DST_TRANSPARENT);
  await makeTransparent(SRC, DST_TRANSPARENT);

  console.log('[2/5] square 512 favicon ->', DST_APP_ICON);
  await squarePadAndResize(DST_TRANSPARENT, 512, DST_APP_ICON, 0.06);

  console.log('[3/5] square 180 apple-icon ->', DST_APPLE_ICON);
  await squarePadAndResize(DST_TRANSPARENT, 180, DST_APPLE_ICON, 0.06);

  console.log('[4/5] PWA 192 / 512 contained ->');
  await squarePadAndResize(DST_TRANSPARENT, 512, DST_PWA_512, 0.06);
  await squarePadAndResize(DST_TRANSPARENT, 192, DST_PWA_192, 0.06);

  console.log('[5/5] PWA 192 / 512 maskable (more padding) ->');
  await squarePadAndResize(DST_TRANSPARENT, 512, DST_PWA_512_MASKED, 0.18);
  await squarePadAndResize(DST_TRANSPARENT, 192, DST_PWA_192_MASKED, 0.18);

  console.log('done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
