import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const source = "public/kesh.png";
const outputDir = "public/icons";

await mkdir(outputDir, { recursive: true });

for (const size of [192, 512]) {
  const output = `${outputDir}/pwa-${size}x${size}.png`;

  await sharp(source)
    .resize(size, size, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(output);

  console.log(`Created ${output}`);
}
