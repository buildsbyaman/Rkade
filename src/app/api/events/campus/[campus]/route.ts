import { NextResponse } from "next/server";
import { getDb, transformMongoDocuments } from "@/lib/mongodb-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campus: string }> },
) {
  try {
    const { campus } = await params;
    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("🎓 API /events/campus - params.campus:", campus);
    console.log("🎓 API /events/campus - today:", today);

    const events = await db
      .collection("events")
      .find({
        campus: campus,
        $or: [{ date: { $gte: today } }, { date: null }],
      })
      .toArray();

    console.log(
      `🎓 API /events/campus - found ${events.length} events for campus: ${campus}`,
    );
    console.log("🎓 API /events/campus - events:", JSON.stringify(events.slice(0, 2), null, 2));

    const transformed = transformMongoDocuments(events);
    console.log("🎓 API /events/campus - transformed:", transformed.length);

    return NextResponse.json(transformed);
  } catch (error) {
    console.error("Error fetching events by campus:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
