/**
 * Removes all background from cat PNGs by flood-filling from the edges.
 * Keeps only the pet (outline + fill). Run: node scripts/remove-pet-background.mjs
 */
import sharp from "sharp";
import { readFile, writeFile, unlink } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(__dirname, "..", "assets");

// Max RGB distance for a pixel to be considered "same" background (removed)
const COLOR_DISTANCE = 42;

const catFiles = ["cat-baby.png", "cat-idle.png", "cat-grown.png"];

function getIdx(x, y, width, channels) {
  return (y * width + x) * channels;
}

function colorDistance(buf, idx, r, g, b, channels) {
  const dr = buf[idx] - r;
  const dg = buf[idx + 1] - g;
  const db = buf[idx + 2] - b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

async function processImage(path) {
  const img = sharp(path);
  const { data, info } = await img
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const buffer = Buffer.from(data);

  // Mark which pixels are background (to be made transparent)
  const isBackground = new Uint8Array(width * height);
  const queue = [];

  // Seed: all edge pixels
  for (let x = 0; x < width; x++) {
    for (const y of [0, height - 1]) {
      const i = (y * width + x) * channels;
      queue.push({ x, y, r: buffer[i], g: buffer[i + 1], b: buffer[i + 2] });
      isBackground[y * width + x] = 1;
    }
  }
  for (let y = 1; y < height - 1; y++) {
    for (const x of [0, width - 1]) {
      const i = (y * width + x) * channels;
      queue.push({ x, y, r: buffer[i], g: buffer[i + 1], b: buffer[i + 2] });
      isBackground[y * width + x] = 1;
    }
  }

  // Flood-fill: expand background to any pixel similar in color to existing background
  const seen = new Set(queue.map((p) => `${p.x},${p.y}`));
  while (queue.length > 0) {
    const { x, y, r, g, b } = queue.shift();
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const key = `${nx},${ny}`;
      if (seen.has(key)) continue;
      const idx = getIdx(nx, ny, width, channels);
      const a = buffer[idx + 3];
      if (a === 0) {
        seen.add(key);
        isBackground[ny * width + nx] = 1;
        continue;
      }
      const dist = colorDistance(buffer, idx, r, g, b, channels);
      if (dist <= COLOR_DISTANCE) {
        seen.add(key);
        isBackground[ny * width + nx] = 1;
        queue.push({
          x: nx,
          y: ny,
          r: buffer[idx],
          g: buffer[idx + 1],
          b: buffer[idx + 2],
        });
      }
    }
  }

  // Make all background pixels fully transparent
  for (let i = 0; i < width * height; i++) {
    if (isBackground[i]) {
      const idx = i * channels;
      buffer[idx + 3] = 0;
    }
  }

  const outPath = path.replace(".png", "-no-bg.png");
  await sharp(buffer, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toFile(outPath);
  return outPath;
}

async function main() {
  for (const name of catFiles) {
    const path = join(assetsDir, name);
    try {
      const outPath = await processImage(path);
      await readFile(outPath).then((buf) => writeFile(path, buf));
      await unlink(outPath);
      console.log("Processed:", name);
    } catch (e) {
      console.error(name, e);
    }
  }
}

main();
