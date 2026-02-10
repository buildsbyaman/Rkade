import { MongoClient, Db, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.MONGODB_DB_NAME || "rkade";

if (!process.env.MONGODB_URI) {
  console.warn(
    "⚠️ MONGODB_URI not set, using default: mongodb://localhost:27017",
  );
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  console.log("URI", MONGODB_URI)
  console.log("URI", DB_NAME)

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

// Helper to convert MongoDB _id to string id for frontend
export function transformMongoDocument<T>(doc: any): T {
  if (!doc) return doc;

  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id.toString(),
  } as T;
}

// Helper to convert array of MongoDB documents
export function transformMongoDocuments<T>(docs: any[]): T[] {
  return docs.map((doc) => transformMongoDocument<T>(doc));
}

// Helper to create ObjectId from string
export function toObjectId(id: string): ObjectId {
  try {
    return new ObjectId(id);
  } catch (error) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
}

// Helper to check if string is valid ObjectId
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

export { ObjectId };
