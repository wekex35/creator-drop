/**
 * Sync Mongo product deliveryUrl fields to Cloudflare PDF URLs.
 *
 *   node --env-file=.env.local scripts/sync-delivery-urls.mjs
 */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "supercreator";
const publicBase = (
  process.env.R2_PUBLIC_BASE_URL || "https://store.creatordrop.in"
).replace(/\/$/, "");

if (!uri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

function pdfUrl(id) {
  return `${publicBase}/creatordrop/deliveries/${id}.pdf`;
}

const client = new MongoClient(uri);
await client.connect();
const col = client.db(dbName).collection("products");
const docs = await col.find({}, { projection: { id: 1, title: 1 } }).toArray();

let updated = 0;
for (const doc of docs) {
  if (!doc.id) continue;
  const deliveryUrl = pdfUrl(doc.id);
  const result = await col.updateOne(
    { id: doc.id },
    { $set: { deliveryUrl, updatedAt: new Date() } },
  );
  if (result.modifiedCount) updated += 1;
  console.log(`✓ ${doc.id} → ${deliveryUrl}`);
}

console.log(`\nUpdated ${updated}/${docs.length} products.`);
await client.close();
