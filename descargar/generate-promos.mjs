// Generate the WhatsApp image and print-ready A6 card from the assets in this folder.
// Requires sharp and pdf-lib: npm install --no-save sharp pdf-lib
// A bundled runtime can also be supplied through CODEX_MODULES.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const folder = path.dirname(fileURLToPath(import.meta.url));
const requireFrom = process.env.CODEX_MODULES
  ? createRequire(pathToFileURL(path.join(process.env.CODEX_MODULES, '_anchor.cjs')))
  : createRequire(import.meta.url);
const sharp = requireFrom('sharp');
const { PDFDocument } = requireFrom('pdf-lib');

const qr = await fs.readFile(path.join(folder, 'qr-blunely.png'));
const googleBadge = await fs.readFile(path.join(folder, 'google-play-badge.png'));
const appleBadge = await sharp(path.join(folder, 'app-store-badge.svg'))
  .resize({ width: 900 }).png().toBuffer();
const logo = await sharp(path.join(folder, 'logo.svg'))
  .resize({ width: 2000 }).png().toBuffer();
const dataUri = (bytes) => `data:image/png;base64,${bytes.toString('base64')}`;
const image = (bytes, x, y, width, height) =>
  `<image href="${dataUri(bytes)}" x="${x}" y="${y}" width="${width}" height="${height}"/>`;

const whatsapp = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1080" height="1920" viewBox="0 0 1080 1920">
  <rect width="1080" height="1920" fill="#f7f4ef"/>
  <rect x="54" y="54" width="972" height="1812" rx="62" fill="#fff"/>
  <rect x="94" y="94" width="892" height="1732" rx="50" fill="#f7f4ef"/>
  ${image(logo, 240, 188, 600, 171)}
  <g fill="#173a32" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="62">
    <text x="540" y="487">Organiza tus rutinas,</text>
    <text x="540" y="566">cuida de ti y sigue</text>
    <text x="540" y="645">tu progreso</text>
  </g>
  <g fill="#173a32" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="32">
    <text x="540" y="743">Tu cuidado personal, organizado.</text>
    <text x="540" y="794">Productos, recordatorios y progreso</text>
    <text x="540" y="840">en un mismo lugar.</text>
  </g>
  ${image(qr, 240, 895, 600, 600)}
  <text x="540" y="1548" text-anchor="middle" fill="#176b61" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="39">Escanea y descarga Blunely</text>
  <text x="540" y="1600" text-anchor="middle" fill="#173a32" font-family="Segoe UI, Arial, sans-serif" font-size="30">Disponible para Android y iOS</text>
  ${image(appleBadge, 185, 1650, 300, 100)}
  ${image(googleBadge, 535, 1634, 350, 135)}
  <text x="540" y="1792" text-anchor="middle" fill="#176b61" font-family="Segoe UI, Arial, sans-serif" font-size="24">monicab1989.github.io/blunely-legal/descargar/</text>
</svg>`;

const card = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1050" height="1480" viewBox="0 0 1050 1480">
  <rect width="1050" height="1480" fill="#f7f4ef"/>
  <rect x="80" y="80" width="890" height="1320" rx="75" fill="#fff"/>
  ${image(logo, 240, 145, 570, 163)}
  <g fill="#173a32" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="57">
    <text x="525" y="390">Organiza tus rutinas,</text>
    <text x="525" y="458">cuida de ti y sigue</text>
    <text x="525" y="526">tu progreso</text>
  </g>
  <g fill="#173a32" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="28">
    <text x="525" y="611">Cuidado personal, productos y recordatorios.</text>
    <text x="525" y="651">Sigue tu progreso a tu ritmo.</text>
  </g>
  ${image(qr, 325, 690, 400, 400)}
  <text x="525" y="1150" text-anchor="middle" fill="#176b61" font-family="Segoe UI, Arial, sans-serif" font-weight="700" font-size="37">Escanea y descarga Blunely</text>
  ${image(appleBadge, 173, 1210, 300, 100)}
  ${image(googleBadge, 528, 1193, 350, 135)}
  <text x="525" y="1365" text-anchor="middle" fill="#176b61" font-family="Segoe UI, Arial, sans-serif" font-size="18">monicab1989.github.io/blunely-legal/descargar/</text>
</svg>`;

await sharp(Buffer.from(whatsapp)).png({ compressionLevel: 9 })
  .toFile(path.join(folder, 'blunely-whatsapp.png'));

// A6: 105 x 148 mm. The art is rasterized at 600 dpi for print.
const cardPng = await sharp(Buffer.from(card))
  .resize(2480, 3496).png({ compressionLevel: 9 }).toBuffer();
const pdf = await PDFDocument.create();
pdf.setTitle('Blunely - tarjeta de descarga A6');
pdf.setSubject('Organiza tus rutinas, cuida de ti y sigue tu progreso');
const page = pdf.addPage([105 * 72 / 25.4, 148 * 72 / 25.4]);
const art = await pdf.embedPng(cardPng);
page.drawImage(art, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
await fs.writeFile(path.join(folder, 'blunely-tarjeta-a6.pdf'), await pdf.save());
