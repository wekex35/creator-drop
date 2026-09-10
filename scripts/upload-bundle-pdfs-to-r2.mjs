/**
 * Upload delivery PDFs to a PRIVATE R2 bucket (no public CDN).
 *
 *   node --env-file=.env.local scripts/upload-bundle-pdfs-to-r2.mjs
 *
 * Requires R2_PRIVATE_BUCKET (recommended: creatordrop-private) with NO
 * public custom domain. Also deletes leftover public delivery objects.
 */
import fs from "fs";
import path from "path";
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const pdfDir = path.join(root, "output", "bundle-pdfs");

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const publicBucket = process.env.R2_BUCKET || "store";
const privateBucket = process.env.R2_PRIVATE_BUCKET?.trim();

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error(
    "Missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY in env",
  );
  process.exit(1);
}

if (!privateBucket) {
  console.error(
    "Set R2_PRIVATE_BUCKET to a bucket WITHOUT a public custom domain (e.g. creatordrop-private)",
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

console.log(`Uploading ${files.length} PDFs → r2://${privateBucket}/deliveries/`);

for (const name of files) {
  const local = path.join(pdfDir, name);
  const key = `deliveries/${name}`;
  const body = fs.readFileSync(local);
  await client.send(
    new PutObjectCommand({
      Bucket: privateBucket,
      Key: key,
      Body: body,
      ContentType: "application/pdf",
      ContentLength: body.length,
      ContentDisposition: `inline; filename="${name}"`,
      CacheControl: "private, max-age=60",
    }),
  );
  console.log(`✓ ${privateBucket}/${key}`);
}

async function wipePrefix(bucket, prefix) {
  const listed = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }),
  );
  let n = 0;
  for (const obj of listed.Contents || []) {
    if (!obj.Key?.endsWith(".pdf")) continue;
    await client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: obj.Key }),
    );
    console.log(`✗ deleted ${bucket}/${obj.Key}`);
    n += 1;
  }
  return n;
}

const deletedPublic =
  (await wipePrefix(publicBucket, "creatordrop/deliveries/")) +
  (await wipePrefix(publicBucket, "creatordrop/private/deliveries/"));

console.log(
  `\nDone. uploaded=${files.length} public_deleted=${deletedPublic} private_bucket=${privateBucket}`,
);
