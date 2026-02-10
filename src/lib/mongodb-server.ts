// Server-side only MongoDB client
// ⚠️ DO NOT import this in client components!
// Use API routes from client components instead

import "server-only";

export {
  getDb,
  connectToDatabase,
  transformMongoDocument,
  transformMongoDocuments,
  toObjectId,
  isValidObjectId,
  ObjectId,
} from "./mongodb";
