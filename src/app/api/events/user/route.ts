import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb, transformMongoDocuments } from "@/lib/mongodb-server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();

    // Get events created by the user - check both field name formats
    const events = await db
      .collection("events")
      .find({
        $or: [
          { creatorEmail: session.user.email },
          { creator_email: session.user.email },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    // ...existing code...
    return NextResponse.json(transformMongoDocuments(events));
  } catch (error) {
    // ...existing code...
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}
