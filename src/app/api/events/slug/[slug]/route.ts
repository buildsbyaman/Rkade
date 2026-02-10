import { NextRequest, NextResponse } from "next/server";
import { getDb, transformMongoDocument } from "@/lib/mongodb-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const db = await getDb();
    const event = await db.collection("events").findOne({ slug });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(transformMongoDocument(event));
  } catch (error) {
    // ...existing code...
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 },
    );
  }
}
