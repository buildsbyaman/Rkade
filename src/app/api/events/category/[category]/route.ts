import { NextResponse } from "next/server";
import { getDb, transformMongoDocuments } from "@/lib/mongodb-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  try {
    const { category } = await params;
    const db = await getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await db
      .collection("events")
      .find({
        category: category,
        $or: [{ date: { $gte: today } }, { date: null }],
      })
      .sort({ date: -1 })
      .toArray();

    return NextResponse.json(transformMongoDocuments(events));
  } catch (error) {
    console.error("Error fetching events by category:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
