import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import sharp from "sharp";

const root = process.cwd();
const sourcePdf = path.join(
  root,
  "output/pdf/twigthetics-lean-athletic-physique-guide-v3-abe-seth.pdf",
);
const previewDirectory = path.join(root, "public/images/guide/previews");
const downloadDirectory = path.join(root, "public/downloads");
const adDirectory = path.join(root, "public/images/ads");

await Promise.all([
  mkdir(previewDirectory, { recursive: true }),
  mkdir(downloadDirectory, { recursive: true }),
  mkdir(adDirectory, { recursive: true }),
]);

const sourceDocument = await PDFDocument.load(await readFile(sourcePdf));
const previewDocument = await PDFDocument.create();
const previewPageIndexes = [0, 8, 17, 23, 29];
const copiedPages = await previewDocument.copyPages(
  sourceDocument,
  previewPageIndexes,
);
const font = await previewDocument.embedFont(StandardFonts.HelveticaBold);

for (const page of copiedPages) {
  previewDocument.addPage(page);
  const { width, height } = page.getSize();
  page.drawRectangle({
    x: 0,
    y: height - 20,
    width,
    height: 20,
    color: rgb(0.12, 0.2, 0.14),
    opacity: 0.96,
  });
  page.drawText("FREE PREVIEW  |  TWIGTHETICS.COM/GUIDE", {
    x: 24,
    y: height - 14,
    size: 7.5,
    font,
    color: rgb(0.95, 0.91, 0.84),
  });
}

await writeFile(
  path.join(downloadDirectory, "twigthetics-guide-preview.pdf"),
  await previewDocument.save(),
);

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
}

async function renderAd({ width, height, fileName, compact = false }) {
  const coverWidth = compact ? 390 : 500;
  const previewWidth = compact ? 300 : 370;
  const visualTop = compact ? 560 : 760;
  const footerHeight = compact ? 230 : 250;
  const cover = await sharp(
    path.join(root, "public/images/guide/lean-athletic-physique-guide-cover.png"),
  )
    .resize({ width: coverWidth })
    .png()
    .toBuffer();
  const macro = await sharp(path.join(previewDirectory, "macro-setup.png"))
    .resize({ width: previewWidth })
    .rotate(-6, { background: "#f5eee4" })
    .png()
    .toBuffer();
  const training = await sharp(path.join(previewDirectory, "training-routine.png"))
    .resize({ width: previewWidth })
    .rotate(6, { background: "#f5eee4" })
    .png()
    .toBuffer();

  const titleSize = compact ? 82 : 108;
  const titleTop = compact ? 220 : 220;
  const subTop = compact ? 430 : 490;
  const footerLabelY = height - footerHeight + (compact ? 54 : 70);
  const footerTitleY = height - footerHeight + (compact ? 112 : 138);
  const footerUrlY = height - footerHeight + (compact ? 184 : 205);
  const svg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f7f0e6"/>
          <stop offset="0.64" stop-color="#efe3d2"/>
          <stop offset="1" stop-color="#d9c6a8"/>
        </linearGradient>
        <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="3" seed="8"/><feColorMatrix values="0 0 0 0 0.2 0 0 0 0 0.16 0 0 0 0 0.1 0 0 0 .09 0"/></filter>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <rect width="${width}" height="${height}" filter="url(#noise)" opacity="0.18"/>
      <text x="64" y="92" font-family="Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="34" letter-spacing="4" fill="#171411">TWIGTHETICS</text>
      <text x="${width - 64}" y="92" text-anchor="end" font-family="Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="25" letter-spacing="2" fill="#326c3d">$49.99  /  ONE TIME</text>
      <line x1="64" y1="126" x2="${width - 64}" y2="126" stroke="#b89a6d" stroke-width="2"/>
      <text x="64" y="${titleTop}" font-family="Arial Narrow, Helvetica Neue, Arial, sans-serif" font-weight="900" font-size="${titleSize}" letter-spacing="-3" fill="#171411">STOP GUESSING.</text>
      <text x="64" y="${titleTop + titleSize * 0.94}" font-family="Arial Narrow, Helvetica Neue, Arial, sans-serif" font-weight="900" font-size="${titleSize}" letter-spacing="-3" fill="#171411">START EXECUTING.</text>
      <text x="66" y="${subTop}" font-family="Helvetica Neue, Arial, sans-serif" font-size="31" fill="#5f574c">Calculate calories. Build meals. Follow complete routines.</text>
      <rect x="64" y="${subTop + 48}" width="410" height="54" rx="27" fill="#203427"/>
      <text x="269" y="${subTop + 83}" text-anchor="middle" font-family="Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="20" letter-spacing="2" fill="#f8f1e8">43-PAGE COMPLETE SYSTEM</text>
      <rect x="0" y="${height - footerHeight}" width="${width}" height="${footerHeight}" fill="#1d3224"/>
      <text x="64" y="${footerLabelY}" font-family="Helvetica Neue, Arial, sans-serif" font-size="24" letter-spacing="3" fill="#b8d9bd">GET LEAN  ·  BUILD MUSCLE  ·  RECOMPOSE</text>
      <text x="64" y="${footerTitleY}" font-family="Arial Narrow, Helvetica Neue, Arial, sans-serif" font-weight="900" font-size="45" fill="#ffffff">GET THE COMPLETE GUIDE</text>
      <text x="${width - 64}" y="${footerUrlY}" text-anchor="end" font-family="Helvetica Neue, Arial, sans-serif" font-weight="700" font-size="30" letter-spacing="2" fill="#ffffff">${escapeXml("TWIGTHETICS.COM/GUIDE  →")}</text>
    </svg>
  `);

  const coverLeft = Math.round((width - coverWidth) / 2);
  const previewY = visualTop + (compact ? 60 : 90);
  await sharp(svg)
    .composite([
      { input: macro, left: 50, top: previewY },
      { input: training, left: width - previewWidth - 50, top: previewY },
      { input: cover, left: coverLeft, top: visualTop },
    ])
    .png({ compressionLevel: 9 })
    .toFile(path.join(adDirectory, fileName));
}

await renderAd({
  width: 1080,
  height: 1920,
  fileName: "twigthetics-guide-ad-vertical.png",
});
await renderAd({
  width: 1080,
  height: 1350,
  fileName: "twigthetics-guide-ad-feed.png",
  compact: true,
});

console.log("Guide previews, sample PDF, and ad creative generated.");
