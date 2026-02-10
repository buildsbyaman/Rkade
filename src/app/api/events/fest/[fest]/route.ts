import { NextResponse } from "next/server";
import { getDb, transformMongoDocuments } from "@/lib/mongodb-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fest: string }> },
) {
  try {
    const { fest } = await params;
    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("🎉 API /events/fest - params.fest:", fest);
    console.log("🎉 API /events/fest - today:", today);

    const events = await db
      .collection("events")
      .find({
        fest: fest,
      })
      .sort({ date: 1 })
      .toArray();

    console.log(
      `🎉 API /events/fest - found ${events.length} events for fest: ${fest}`,
    );
    console.log("🎉 API /events/fest - events:", JSON.stringify(events.slice(0, 2), null, 2));

    const transformed = transformMongoDocuments(events);
    console.log("🎉 API /events/fest - transformed:", transformed.length);

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching events by fest:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
