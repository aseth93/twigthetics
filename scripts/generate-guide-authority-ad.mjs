import sharp from "sharp";
import path from "node:path";

const root = process.cwd();
const photo = path.join(root, "public/images/coach/coach-d93-checkin.jpg");
const output = path.join(
  root,
  "public/images/ads/twigthetics-guide-authority-feed.jpg",
);
const storyOutput = path.join(
  root,
  "public/images/ads/twigthetics-guide-authority-story.jpg",
);

const width = 1080;
const height = 1350;

const overlay = Buffer.from(`
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0b0b09" stop-opacity="0.06"/>
        <stop offset="0.46" stop-color="#0b0b09" stop-opacity="0.08"/>
        <stop offset="0.69" stop-color="#0b0b09" stop-opacity="0.76"/>
        <stop offset="1" stop-color="#0b0b09" stop-opacity="0.98"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="7" flood-color="#000" flood-opacity="0.55"/>
      </filter>
    </defs>

    <rect width="1080" height="1350" fill="url(#shade)"/>

    <text x="58" y="75" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="4">TWIGTHETICS</text>
    <rect x="770" y="40" width="252" height="54" rx="27" fill="#e8d6b8" fill-opacity="0.96"/>
    <text x="896" y="76" text-anchor="middle" fill="#1b201a" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="2">IFBB PRO</text>

    <g filter="url(#shadow)">
      <text x="58" y="985" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="800" letter-spacing="-1">EVERYTHING YOU NEED</text>
      <text x="58" y="1058" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="800" letter-spacing="-1">TO BUILD YOUR OWN PLAN.</text>
    </g>

    <text x="60" y="1124" fill="#d7dfd5" font-family="Helvetica, Arial, sans-serif" font-size="27" font-weight="500">Calories · macros · meals · complete routines · adjustments</text>

    <rect x="58" y="1170" width="300" height="72" rx="36" fill="#2f7a43"/>
    <text x="208" y="1217" text-anchor="middle" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="2">$49.99 ONCE</text>

    <text x="58" y="1310" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="31" font-weight="700" letter-spacing="2">TWIGTHETICS.COM/GUIDE</text>
    <path d="M948 1298h62m0 0-18-18m18 18-18 18" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
`);

await sharp(photo)
  .resize(width, height, { fit: "cover", position: "center" })
  .composite([{ input: overlay }])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(output);

console.log(output);

const storyOverlay = Buffer.from(`
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="storyShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0b0b09" stop-opacity="0.12"/>
        <stop offset="0.50" stop-color="#0b0b09" stop-opacity="0.08"/>
        <stop offset="0.69" stop-color="#0b0b09" stop-opacity="0.74"/>
        <stop offset="1" stop-color="#0b0b09" stop-opacity="0.99"/>
      </linearGradient>
      <filter id="storyShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <rect width="1080" height="1920" fill="url(#storyShade)"/>
    <text x="64" y="112" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="38" font-weight="700" letter-spacing="5">TWIGTHETICS</text>
    <rect x="762" y="67" width="260" height="62" rx="31" fill="#e8d6b8" fill-opacity="0.96"/>
    <text x="892" y="108" text-anchor="middle" fill="#1b201a" font-family="Helvetica, Arial, sans-serif" font-size="25" font-weight="700" letter-spacing="2">IFBB PRO</text>

    <g filter="url(#storyShadow)">
      <text x="62" y="1390" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="72" font-weight="800" letter-spacing="-1">EVERYTHING YOU NEED</text>
      <text x="62" y="1474" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="72" font-weight="800" letter-spacing="-1">TO BUILD YOUR OWN PLAN.</text>
    </g>
    <text x="64" y="1550" fill="#d7dfd5" font-family="Helvetica, Arial, sans-serif" font-size="29" font-weight="500">Calories · macros · meals · complete routines · adjustments</text>

    <rect x="62" y="1605" width="318" height="78" rx="39" fill="#2f7a43"/>
    <text x="221" y="1656" text-anchor="middle" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" letter-spacing="2">$49.99 ONCE</text>

    <rect x="62" y="1734" width="956" height="104" rx="52" fill="#ffffff"/>
    <text x="540" y="1801" text-anchor="middle" fill="#172019" font-family="Helvetica, Arial, sans-serif" font-size="32" font-weight="800" letter-spacing="3">TWIGTHETICS.COM/GUIDE  →</text>
  </svg>
`);

await sharp(photo)
  .resize(1080, 1920, { fit: "cover", position: "center" })
  .composite([{ input: storyOverlay }])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(storyOutput);

console.log(storyOutput);
