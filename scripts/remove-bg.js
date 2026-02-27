/**
 * Removes near-white backgrounds from cat PNG images.
 * Converts white/near-white pixels to transparent.
 */
const sharp = require("sharp");
const path = require("path");

const ASSETS = path.join(__dirname, "../assets");

const images = ["cat-baby.png", "cat-idle.png", "cat-grown.png"];

async function removeBackground(filename) {
  const inputPath = path.join(ASSETS, filename);
  const img = sharp(inputPath);
  const { width, height } = await img.metadata();

  // Get raw RGB data
  const rawBuf = await img.raw().toBuffer();
  const totalPixels = width * height;

  // Create RGBA buffer
  const rgba = Buffer.alloc(totalPixels * 4);

  for (let i = 0; i < totalPixels; i++) {
    const r = rawBuf[i * 3];
    const g = rawBuf[i * 3 + 1];
    const b = rawBuf[i * 3 + 2];

    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;

    // "Color to alpha": based on how close to white each pixel is,
    // compute alpha proportionally (0 = fully transparent, 255 = opaque)
    // Uses the luminance of "how white" the pixel is as transparency factor.
    const whiteness = Math.min(r, g, b); // 255 = pure white, 0 = dark
    // Make pixels above threshold progressively transparent
    const threshold = 230;
    if (whiteness >= threshold) {
      // Scale from fully transparent at 255 to fully opaque at threshold
      const alpha = Math.round(((255 - whiteness) / (255 - threshold)) * 255);
      rgba[i * 4 + 3] = alpha;
    } else {
      rgba[i * 4 + 3] = 255; // fully opaque
    }
  }

  await sharp(rgba, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toFile(inputPath);

  console.log(`✓ Processed ${filename}`);
}

(async () => {
  for (const img of images) {
    await removeBackground(img);
  }
  console.log("Done!");
})();
