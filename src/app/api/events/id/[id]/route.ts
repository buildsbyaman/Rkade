import { NextRequest, NextResponse } from "next/server";
import { getDb, transformMongoDocument } from "@/lib/mongodb-server";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const db = await getDb();
    let event = null;

    // Try as ObjectId first
    try {
      event = await db.collection("events").findOne({ _id: new ObjectId(id) });
    } catch {
      // Not a valid ObjectId, try as slug
      event = await db.collection("events").findOne({ slug: id });
    }

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(transformMongoDocument(event));
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
