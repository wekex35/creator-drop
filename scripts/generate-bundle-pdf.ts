/**
 * Generate branded delivery PDFs for CreatorDrop bundles.
 *
 * Usage:
 *   npx tsx scripts/generate-bundle-pdf.ts --id=luxury-reels
 *   npx tsx scripts/generate-bundle-pdf.ts --all
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

import { SITE_NAME, SITE_URL } from "../src/data/contact";
import { getContentDownloadUrl } from "../src/data/delivery";
import { products, type Product } from "../src/data/products";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "output", "bundle-pdfs");

const COLORS = {
  bg: "#05050d",
  panel: "#0c0c1a",
  card: "#121224",
  accent: "#ff7a00",
  accentSoft: "#ff9a33",
  gold: "#e8a800",
  white: "#ffffff",
  muted: "#9795a8",
  line: "#2a2a3d",
};

function argValue(flag: string) {
  const hit = process.argv.find((a) => a.startsWith(`${flag}=`));
  return hit ? hit.slice(flag.length + 1) : undefined;
}

function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

function wrapText(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  options: PDFKit.Mixins.TextOptions = {},
) {
  doc.text(text, x, y, { width, ...options });
  return doc.y;
}

async function buildPdf(product: Product, outPath: string) {
  const deliveryUrl = getContentDownloadUrl(product.id);
  const qrDataUrl = await QRCode.toDataURL(deliveryUrl, {
    margin: 1,
    width: 220,
    color: { dark: "#05050d", light: "#ffffff" },
  });
  const qrPng = Buffer.from(qrDataUrl.split(",")[1]!, "base64");

  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });

  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    info: {
      Title: `${product.title} – Download Access`,
      Author: SITE_NAME,
      Subject: `Instant download access for ${product.title}`,
      Creator: SITE_NAME,
    },
  });

  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  const pageW = doc.page.width;
  const pageH = doc.page.height;
  const pad = 40;

  // Full dark background
  doc.rect(0, 0, pageW, pageH).fill(COLORS.bg);

  // Top accent bar
  doc.rect(0, 0, pageW, 6).fill(COLORS.accent);

  // Soft glow circles (approx)
  doc
    .circle(pageW - 80, 90, 120)
    .fillOpacity(0.12)
    .fill(COLORS.accent)
    .fillOpacity(1);
  doc
    .circle(60, pageH - 80, 100)
    .fillOpacity(0.08)
    .fill(COLORS.gold)
    .fillOpacity(1);

  // Brand header
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor(COLORS.white)
    .text(SITE_NAME, pad, 36, { continued: false });
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text("Instant digital delivery · Lifetime access", pad, 64);

  // Badge pill
  const badge = product.badge.toUpperCase();
  doc.roundedRect(pad, 96, doc.widthOfString(badge) + 24, 22, 11).fill(COLORS.card);
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(COLORS.accentSoft)
    .text(badge, pad + 12, 102);

  // Title
  let y = 136;
  doc
    .font("Helvetica-Bold")
    .fontSize(26)
    .fillColor(COLORS.white);
  y = wrapText(doc, product.title, pad, y, pageW - pad * 2, {
    lineGap: 4,
  });

  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor(COLORS.muted);
  y = wrapText(doc, product.tagline, pad, y + 10, pageW - pad * 2, {
    lineGap: 3,
  });

  // Download card
  y += 28;
  const cardX = pad;
  const cardW = pageW - pad * 2;
  const cardH = 210;
  doc.roundedRect(cardX, y, cardW, cardH, 16).fill(COLORS.panel);
  doc
    .roundedRect(cardX, y, 6, cardH, 3)
    .fill(COLORS.accent);

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.accent)
    .text("YOUR DOWNLOAD LINK", cardX + 24, y + 22);

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(COLORS.white)
    .text("Open your pack on Google Drive", cardX + 24, y + 44, {
      width: cardW - 180,
    });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text(
      "Scan the QR code or tap the link below. Bookmark it — this is your lifetime access.",
      cardX + 24,
      y + 78,
      { width: cardW - 180, lineGap: 2 },
    );

  // Link box
  const linkY = y + 120;
  doc.roundedRect(cardX + 24, linkY, cardW - 180, 58, 10).fill(COLORS.card);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.accentSoft)
    .text(deliveryUrl, cardX + 36, linkY + 20, {
      width: cardW - 204,
      link: deliveryUrl,
      underline: true,
    });

  // QR
  const qrSize = 120;
  const qrX = cardX + cardW - qrSize - 28;
  const qrY = y + 44;
  doc.roundedRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 12).fill(COLORS.white);
  doc.image(qrPng, qrX, qrY, { width: qrSize, height: qrSize });

  // Includes
  y += cardH + 28;
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(COLORS.white)
    .text("What's included", pad, y);
  y += 22;

  for (const item of product.includes) {
    doc.circle(pad + 6, y + 6, 3).fill(COLORS.accent);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(COLORS.white)
      .text(item, pad + 18, y, { width: pageW - pad * 2 - 18 });
    y = doc.y + 8;
  }

  // How to use
  y += 12;
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor(COLORS.white)
    .text("How to use", pad, y);
  y += 20;

  const steps = [
    "Open the Drive link (or scan the QR) on your phone or laptop.",
    "Download the clips you want — no watermark, ready to post.",
    "Add your caption, music, and logo, then publish on Reels / Shorts.",
  ];
  steps.forEach((step, i) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(COLORS.accent)
      .text(`${i + 1}.`, pad, y);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(COLORS.white)
      .text(step, pad + 22, y, { width: pageW - pad * 2 - 22 });
    y = doc.y + 8;
  });

  // Support footer card
  const footerH = 88;
  const footerY = pageH - footerH - 28;
  doc.roundedRect(pad, footerY, pageW - pad * 2, footerH, 14).fill(COLORS.panel);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(COLORS.white)
    .text("Need help?", pad + 22, footerY + 18);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text(SITE_URL, pad + 22, footerY + 40, {
      width: pageW - pad * 2 - 44,
      link: SITE_URL,
    });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text(
      `${SITE_NAME} · Pack ID: ${product.id} · Keep this PDF for lifetime access`,
      pad + 22,
      footerY + 62,
    );

  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

async function main() {
  const id = argValue("--id");
  const all = hasFlag("--all");

  if (!id && !all) {
    console.error(
      "Usage:\n  npx tsx scripts/generate-bundle-pdf.ts --id=luxury-reels\n  npx tsx scripts/generate-bundle-pdf.ts --all",
    );
    process.exit(1);
  }

  const selected = all
    ? products
    : products.filter((p) => p.id === id);

  if (!selected.length) {
    console.error(`No product found for id="${id}"`);
    console.error("Available:", products.map((p) => p.id).join(", "));
    process.exit(1);
  }

  await fs.promises.mkdir(OUT_DIR, { recursive: true });

  for (const product of selected) {
    const outPath = path.join(OUT_DIR, `${product.id}.pdf`);
    await buildPdf(product, outPath);
    console.log(`✓ ${product.id} → ${path.relative(ROOT, outPath)}`);
    console.log(`  content: ${getContentDownloadUrl(product.id)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
