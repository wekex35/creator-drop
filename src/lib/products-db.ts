import type { Collection, WithId } from "mongodb";
import { getDeliveryUrl } from "@/data/delivery";
import {
  products as catalogSeed,
  type Product,
} from "@/data/products";
import { getDb } from "@/lib/mongodb";

export type ProductRecord = Product & {
  deliveryUrl: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

declare global {
  // eslint-disable-next-line no-var
  var __creatordropProductIndexesReady: Promise<void> | undefined;
}

async function ensureIndexes() {
  if (!global.__creatordropProductIndexesReady) {
    global.__creatordropProductIndexesReady = (async () => {
      const db = await getDb();
      await Promise.all([
        db.collection("products").createIndex({ id: 1 }, { unique: true }),
        db.collection("products").createIndex({ featured: -1, reviews: -1 }),
        db.collection("products").createIndex({ active: 1 }),
      ]);
    })();
  }
  await global.__creatordropProductIndexesReady;
}

async function productsCol(): Promise<Collection<ProductRecord>> {
  await ensureIndexes();
  const db = await getDb();
  return db.collection<ProductRecord>("products");
}

function toProduct(doc: WithId<ProductRecord> | ProductRecord): Product {
  return {
    id: doc.id,
    title: doc.title,
    tagline: doc.tagline,
    price: doc.price,
    compareAt: doc.compareAt,
    category: doc.category,
    badge: doc.badge,
    rating: doc.rating,
    reviews: doc.reviews,
    accent: doc.accent,
    image: doc.image,
    featured: doc.featured,
    headline: doc.headline,
    includes: doc.includes,
    proof: doc.proof,
    proofName: doc.proofName,
    countLabel: doc.countLabel,
    samples: doc.samples,
  };
}

export async function seedProducts() {
  const col = await productsCol();
  const now = new Date();
  let upserted = 0;

  for (const product of catalogSeed) {
    const result = await col.updateOne(
      { id: product.id },
      {
        $set: {
          ...product,
          deliveryUrl: getDeliveryUrl(product.id),
          active: true,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
    if (result.upsertedCount || result.modifiedCount) upserted += 1;
  }

  return { count: catalogSeed.length, upserted };
}

export async function listProducts(options?: {
  activeOnly?: boolean;
}): Promise<Product[]> {
  try {
    const col = await productsCol();
    const activeOnly = options?.activeOnly ?? true;
    const count = await col.countDocuments(activeOnly ? { active: true } : {});

    if (count === 0) {
      await seedProducts();
    }

    const docs = await col
      .find(activeOnly ? { active: true } : {})
      .sort({ featured: -1, reviews: -1 })
      .toArray();

    return docs.map(toProduct);
  } catch (error) {
    console.error("listProducts falling back to seed:", error);
    return catalogSeed;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const col = await productsCol();
    let doc = await col.findOne({ id, active: true });
    if (!doc) {
      const seeded = catalogSeed.find((p) => p.id === id);
      if (!seeded) return null;
      await seedProducts();
      doc = await col.findOne({ id, active: true });
    }
    return doc ? toProduct(doc) : null;
  } catch (error) {
    console.error("getProductById falling back to seed:", error);
    return catalogSeed.find((p) => p.id === id) ?? null;
  }
}

export async function getProductRecord(id: string) {
  const col = await productsCol();
  return col.findOne({ id });
}

export async function listProductRecords(options?: {
  activeOnly?: boolean;
}): Promise<ProductRecord[]> {
  const col = await productsCol();
  const activeOnly = options?.activeOnly ?? false;
  const count = await col.countDocuments(activeOnly ? { active: true } : {});
  if (count === 0) {
    await seedProducts();
  }
  return col
    .find(activeOnly ? { active: true } : {})
    .sort({ featured: -1, updatedAt: -1 })
    .toArray()
    .then((docs) =>
      docs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        tagline: doc.tagline,
        price: doc.price,
        compareAt: doc.compareAt,
        category: doc.category,
        badge: doc.badge,
        rating: doc.rating,
        reviews: doc.reviews,
        accent: doc.accent,
        image: doc.image,
        featured: doc.featured,
        headline: doc.headline,
        includes: doc.includes,
        proof: doc.proof,
        proofName: doc.proofName,
        countLabel: doc.countLabel,
        samples: doc.samples,
        deliveryUrl: doc.deliveryUrl,
        active: doc.active,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
    );
}

const CATEGORIES = new Set(["templates", "ebooks", "presets", "audits"]);

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export type ProductInput = {
  id?: string;
  title: string;
  tagline: string;
  headline: string;
  price: number;
  compareAt: number;
  category: Product["category"];
  badge: string;
  rating: number;
  reviews: number;
  accent: string;
  image: string;
  featured?: boolean;
  includes: string[];
  proof: string;
  proofName: string;
  countLabel: string;
  samples: string[];
  deliveryUrl: string;
  active?: boolean;
};

export function parseProductInput(body: unknown): ProductInput | string {
  if (!body || typeof body !== "object") return "Invalid body";
  const b = body as Record<string, unknown>;

  const title = String(b.title ?? "").trim();
  if (title.length < 2) return "Title is required";

  const category = String(b.category ?? "templates");
  if (!CATEGORIES.has(category)) return "Invalid category";

  const price = Number(b.price);
  const compareAt = Number(b.compareAt);
  if (!Number.isFinite(price) || price < 0) return "Invalid price";
  if (!Number.isFinite(compareAt) || compareAt < 0) return "Invalid compare-at";

  const includesRaw = b.includes;
  const includes = Array.isArray(includesRaw)
    ? includesRaw.map((x) => String(x).trim()).filter(Boolean)
    : String(includesRaw ?? "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

  const samplesRaw = b.samples;
  const samples = Array.isArray(samplesRaw)
    ? samplesRaw.map((x) => String(x).trim()).filter(Boolean)
    : String(samplesRaw ?? "")
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

  const id = String(b.id ?? "").trim() || slugify(title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    return "ID must be lowercase letters, numbers, and hyphens";
  }

  return {
    id,
    title,
    tagline: String(b.tagline ?? "").trim(),
    headline: String(b.headline ?? "").trim(),
    price,
    compareAt,
    category: category as Product["category"],
    badge: String(b.badge ?? "Reel Bundle").trim() || "Reel Bundle",
    rating: Number(b.rating) || 4.9,
    reviews: Math.max(0, Math.floor(Number(b.reviews) || 0)),
    accent: String(b.accent ?? "#FF7A00").trim() || "#FF7A00",
    image: String(b.image ?? "").trim(),
    featured: Boolean(b.featured),
    includes,
    proof: String(b.proof ?? "").trim(),
    proofName: String(b.proofName ?? "").trim(),
    countLabel: String(b.countLabel ?? "").trim(),
    samples,
    deliveryUrl:
      String(b.deliveryUrl ?? "").trim() || getDeliveryUrl(id),
    active: b.active === undefined ? true : Boolean(b.active),
  };
}

export async function createProduct(input: ProductInput) {
  const col = await productsCol();
  const id = input.id!;
  const existing = await col.findOne({ id });
  if (existing) {
    throw new Error(`Product already exists: ${id}`);
  }

  const now = new Date();
  const record: ProductRecord = {
    id,
    title: input.title,
    tagline: input.tagline,
    headline: input.headline,
    price: input.price,
    compareAt: input.compareAt,
    category: input.category,
    badge: input.badge,
    rating: input.rating,
    reviews: input.reviews,
    accent: input.accent,
    image: input.image,
    featured: input.featured,
    includes: input.includes,
    proof: input.proof,
    proofName: input.proofName,
    countLabel: input.countLabel,
    samples: input.samples,
    deliveryUrl: input.deliveryUrl,
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };

  await col.insertOne(record);
  return record;
}

export async function updateProduct(id: string, input: ProductInput) {
  const col = await productsCol();
  const now = new Date();
  const result = await col.findOneAndUpdate(
    { id },
    {
      $set: {
        title: input.title,
        tagline: input.tagline,
        headline: input.headline,
        price: input.price,
        compareAt: input.compareAt,
        category: input.category,
        badge: input.badge,
        rating: input.rating,
        reviews: input.reviews,
        accent: input.accent,
        image: input.image,
        featured: input.featured,
        includes: input.includes,
        proof: input.proof,
        proofName: input.proofName,
        countLabel: input.countLabel,
        samples: input.samples,
        deliveryUrl: input.deliveryUrl,
        active: input.active ?? true,
        updatedAt: now,
      },
    },
    { returnDocument: "after" },
  );

  if (!result) throw new Error("Product not found");
  return result;
}

export async function setProductActive(id: string, active: boolean) {
  const col = await productsCol();
  const result = await col.findOneAndUpdate(
    { id },
    { $set: { active, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!result) throw new Error("Product not found");
  return result;
}

export async function setProductFeatured(id: string, featured: boolean) {
  const col = await productsCol();
  const result = await col.findOneAndUpdate(
    { id },
    { $set: { featured, updatedAt: new Date() } },
    { returnDocument: "after" },
  );
  if (!result) throw new Error("Product not found");
  return result;
}

export async function deleteProduct(id: string) {
  const col = await productsCol();
  const result = await col.deleteOne({ id });
  if (result.deletedCount === 0) throw new Error("Product not found");
  return { deleted: true };
}
