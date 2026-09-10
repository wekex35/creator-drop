/**
 * Upload generated bundle PDFs to R2 and print public URLs.
 *
 *   node --env-file=.env.local scripts/upload-bundle-pdfs-to-r2.mjs
 */
import fs from "fs";
import path from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const pdfDir = path.join(root, "output", "bundle-pdfs");

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET || "store";
const prefix = "creatordrop/deliveries";
const publicBase = (
  process.env.R2_PUBLIC_BASE_URL || "https://store.creatordrop.in"
).replace(/\/$/, "");

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error(
    "Missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY in env",
  );
  process.exit(1);
}

if (!fs.existsSync(pdfDir)) {
  console.error(`Missing ${pdfDir} — run generate-bundle-pdf.ts --all first`);
  process.exit(1);
}

const client = new S3Client({
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
  region: "auto",
  forcePathStyle: false,
});

const files = fs
  .readdirSync(pdfDir)
  .filter((name) => name.endsWith(".pdf"))
  .sort();

if (!files.length) {
  console.error("No PDFs found in output/bundle-pdfs");
  process.exit(1);
}

const uploaded = [];
for (const name of files) {
  const local = path.join(pdfDir, name);
  const key = `${prefix}/${name}`;
  const body = fs.readFileSync(local);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "application/pdf",
      ContentLength: body.length,
      ContentDisposition: `inline; filename="${name}"`,
      CacheControl: "public, max-age=3600",
    }),
  );
  const url = `${publicBase}/${key}`;
  uploaded.push({ id: name.replace(/\.pdf$/, ""), url });
  console.log(`✓ ${key}`);
  console.log(`  ${url}`);
}

console.log(`\nUploaded ${uploaded.length} PDFs.`);
