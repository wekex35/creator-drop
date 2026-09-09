/**
 * Upload public/products + public/samples to R2 under creatordrop/.
 * Credentials: R2_* from .env.local (same as media client in cloudflare.ts).
 *
 *   node --env-file=.env.local scripts/upload-assets-to-r2.mjs
 */
import fs from "fs";
import path from "path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET || "store";
const prefix = "creatordrop";
const publicBase = (
  process.env.R2_PUBLIC_BASE_URL || "https://store.creatordrop.in"
).replace(/\/$/, "");
const concurrency = Number(process.env.R2_UPLOAD_CONCURRENCY || 6);

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error(
    "Missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY in env",
  );
  process.exit(1);
}

const client = new S3Client({
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
  region: "auto",
  forcePathStyle: false,
});

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".mp4") return "video/mp4";
  if (ext === ".webm") return "video/webm";
  return "application/octet-stream";
}

function collectJobs() {
  const jobs = [];
  const productsDir = path.join(root, "public/products");
  for (const name of fs.readdirSync(productsDir)) {
    const full = path.join(productsDir, name);
    if (!fs.statSync(full).isFile()) continue;
    jobs.push({ local: full, key: `${prefix}/products/${name}` });
  }

  const samplesRoot = path.join(root, "public/samples");
  for (const productId of fs.readdirSync(samplesRoot)) {
    const dir = path.join(samplesRoot, productId);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      if (!fs.statSync(full).isFile()) continue;
      jobs.push({
        local: full,
        key: `${prefix}/samples/${productId}/${name}`,
      });
    }
  }
  return jobs;
}

async function uploadOne(job) {
  const body = fs.readFileSync(job.local);
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: job.key,
      Body: body,
      ContentType: contentType(job.local),
      ContentLength: body.length,
    }),
  );
  return `${publicBase}/${job.key}`;
}

async function runPool(jobs, limit) {
  let i = 0;
  let done = 0;
  const errors = [];
  async function worker() {
    while (i < jobs.length) {
      const job = jobs[i++];
      try {
        await uploadOne(job);
        done++;
        if (done % 10 === 0 || done === jobs.length) {
          console.log(`[${done}/${jobs.length}] ${job.key}`);
        }
      } catch (err) {
        errors.push({ key: job.key, error: String(err?.message || err) });
        console.error(`FAIL ${job.key}:`, err?.message || err);
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, () => worker()));
  return errors;
}

const jobs = collectJobs();
console.log(`Uploading ${jobs.length} files to r2://${bucket}/${prefix}/ ...`);
const errors = await runPool(jobs, concurrency);
console.log(`Done. ok=${jobs.length - errors.length} fail=${errors.length}`);
if (errors.length) process.exitCode = 1;
