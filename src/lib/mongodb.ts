import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "supercreator";

declare global {
  // eslint-disable-next-line no-var
  var __creatordropMongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise() {
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!global.__creatordropMongoClientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8_000,
    });
    global.__creatordropMongoClientPromise = client.connect();
  }

  return global.__creatordropMongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(dbName);
}
