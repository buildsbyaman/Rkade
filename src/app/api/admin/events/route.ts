import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isUserAdmin } from "@/lib/admin-auth";
import { getDb, toObjectId } from "@/lib/mongodb-server";
import { getQRCodeData } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isUserAdmin(session.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await getDb();

    // All Admins can see all events (Read-only for regular admins)
    const events = await db
      .collection("events")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Get booking stats for each event
    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const bookings = await db
          .collection("bookings")
          .find({ eventId: event._id })
          .toArray();

        // Check verification status from Redis
        let verifiedCount = 0;
        for (const booking of bookings) {
          if (booking.qrCodeToken) {
            const qrData = await getQRCodeData(booking.qrCodeToken);
            if (qrData?.scanned) {
              verifiedCount++;
            }
          }
        }

        return {
          id: event._id.toString(),
          eventName: event.eventName,
          date: event.date,
          venue: event.venue,
          category: event.category,
          price: event.price,
          totalBookings: bookings.length,
          verifiedBookings: verifiedCount,
          description: event.description,
        };
      })
    );

    return NextResponse.json(eventsWithStats);
  } catch (error) {
    console.error("Error fetching admin events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
