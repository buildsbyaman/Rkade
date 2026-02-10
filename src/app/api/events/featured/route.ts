import { NextResponse } from "next/server";
import { getDb, transformMongoDocuments } from "@/lib/mongodb-server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "3");
    const eventType = searchParams.get("eventType");

    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Build query - only filter by eventType if explicitly provided
    const query: any = {
      $or: [{ date: { $gte: today } }, { date: null }],
    };

    if (eventType) {
      query.eventType = eventType;
    }

    const events = await db
      .collection("events")
      .find(query)
      .sort({ date: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(transformMongoDocuments(events));
  } catch (error) {
    // ...existing code...
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
