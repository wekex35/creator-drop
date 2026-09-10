/**
 * Point Mongo product deliveryUrl at the private marker (no public CDN URLs).
 *
 *   node --env-file=.env.local scripts/sync-delivery-urls.mjs
 */
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "supercreator";
const PRIVATE_DELIVERY_MARKER = "private:r2-pdf";

if (!uri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();
const col = client.db(dbName).collection("products");
const docs = await col.find({}, { projection: { id: 1, title: 1 } }).toArray();

let updated = 0;
for (const doc of docs) {
  if (!doc.id) continue;
  const result = await col.updateOne(
    { id: doc.id },
    {
      $set: {
        deliveryUrl: PRIVATE_DELIVERY_MARKER,
        updatedAt: new Date(),
      },
    },
  );
  if (result.modifiedCount) updated += 1;
  console.log(`✓ ${doc.id} → ${PRIVATE_DELIVERY_MARKER}`);
}

console.log(`\nUpdated ${updated}/${docs.length} products.`);
await client.close();
