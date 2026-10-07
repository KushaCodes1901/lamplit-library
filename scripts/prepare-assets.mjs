import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const source = process.argv[2];
if (!source) throw new Error("Pass the generated-image source directory.");
const dest = path.resolve("public/assets");
await mkdir(dest, { recursive: true });
const files = {
  room: "exec-48171f27-b382-4b6f-8ee9-b3461798fdd1.png",
  shelf: "exec-655a9f85-0815-4407-9431-738066489777.png",
  table: "exec-64f98e6e-c1e7-4832-9a2a-66dcf3e0d5da.png",
  visitor: "exec-30cea94c-f2f4-4815-8446-57dcd55b3593.png",
};
for (const [name, file] of Object.entries(files)) {
  const img = sharp(path.join(source, file));
  const meta = await img.metadata();
  console.log(name, meta.width, meta.height, "alpha:", meta.hasAlpha);
  if (name === "visitor") {
    const cw = Math.floor(meta.width / 4),
      ch = Math.floor(meta.height / 3);
    const sprites = [];
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 4; col++) {
        const cell = await sharp(path.join(source, file))
          .extract({ left: col * cw, top: row * ch, width: cw, height: ch })
          .toBuffer();
        const frame = await sharp(cell)
          .trim()
          .resize({ height: 166, width: 90, fit: "inside" })
          .toBuffer();
        const fm = await sharp(frame).metadata();
        sprites.push({
          input: frame,
          left: col * 96 + Math.round((96 - fm.width) / 2),
          top: row * 176 + 170 - fm.height,
        });
      }
    await sharp({
      create: { width: 384, height: 528, channels: 4, background: "#00000000" },
    })
      .composite(sprites)
      .webp({ lossless: true })
      .toFile(path.join(dest, "visitor.webp"));
  } else {
    if (name !== "room") img.trim();
    await img
      .resize({ width: name === "room" ? 1536 : 700 })
      .webp({ quality: name === "room" ? 86 : 88, alphaQuality: 100 })
      .toFile(path.join(dest, `${name}.webp`));
  }
}
