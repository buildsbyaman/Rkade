import {
  getDb,
  toObjectId,
  transformMongoDocument,
  transformMongoDocuments,
} from "./mongodb-server";

export interface CreateEventInput {
  eventName: string;
  landscapePoster: string;
  portraitPoster: string;
  slug?: string;
  date?: string;
  time: string;
  duration: string;
  ageLimit: string;
  language: string;
  category: string;
  eventType: string;
  venue: string;
  price: string;
  description: string;
  performers: string;
  creatorEmail: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  isTeamEvent?: boolean;
}

export async function createEvent(event: CreateEventInput) {
  const db = await getDb();
  const result = await db.collection("events").insertOne({
    eventName: event.eventName,
    slug:
      event.slug ??
      event.eventName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-"),
    landscapePoster: event.landscapePoster,
    portraitPoster: event.portraitPoster,
    date: event.date && event.date.trim() !== "" ? event.date : null,
    time: event.time,
    duration: event.duration,
    ageLimit: event.ageLimit,
    eventType: event.eventType,
    language: event.language,
    category: event.category,
    venue: event.venue,
    price: event.price,
    description: event.description,
    performers: event.performers,
    creatorEmail: event.creatorEmail,
    minTeamSize: event.isTeamEvent ? event.minTeamSize || 1 : 1,
    maxTeamSize: event.isTeamEvent ? event.maxTeamSize || 10 : 1,
    isTeamEvent: event.isTeamEvent || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const data = await db
    .collection("events")
    .findOne({ _id: result.insertedId });
  return transformMongoDocument(data);
}

export async function getEventBySlug(slug?: string) {
  if (!slug) return null;
  const normalized = slug.toString().toLowerCase();
  const db = await getDb();
  const data = await db.collection("events").findOne({ slug: normalized });
  if (!data) {
    // Return null on not found or other error; caller can decide how to handle
    return null;
  }
  return transformMongoDocument(data);
}

// Server-side function to fetch events
export async function getEvents() {
  try {
    const db = await getDb();
    const data = await db
      .collection("events")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    return transformMongoDocuments(data);
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

// Server-side function to fetch events by category
export async function getEventsByCategory(category: string) {
  try {
    const db = await getDb();
    const data = await db
      .collection("events")
      .find({ category })
      .sort({ createdAt: -1 })
      .toArray();
    return transformMongoDocuments(data);
  } catch (error) {
    console.error("Error fetching events by category:", error);
    return [];
  }
}

// Server-side function to fetch events by event type
export async function getEventsByType(eventType: string) {
  try {
    const db = await getDb();
    const data = await db
      .collection("events")
      .find({ eventType })
      .sort({ createdAt: -1 })
      .toArray();
    return transformMongoDocuments(data);
  } catch (error) {
    console.error("Error fetching events by type:", error);
    return [];
  }
}

// Server-side function to fetch featured events
export async function getFeaturedEvents(limit: number = 3) {
  try {
    const db = await getDb();
    const data = await db
      .collection("events")
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    return transformMongoDocuments(data);
  } catch (error) {
    console.error("Error fetching featured events:", error);
    return [];
  }
}
