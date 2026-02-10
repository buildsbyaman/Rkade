import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isUserAdmin } from "@/lib/admin-auth";
import { getDb, toObjectId } from "@/lib/mongodb-server";
import { getQRCodeData } from "@/lib/redis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isUserAdmin(session.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const eventId = id;
    const db = await getDb();
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    // Get event details
    const event = await db
      .collection("events")
      .findOne({ _id: toObjectId(eventId) });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // For non-super admins, check if they created the event or if createdBy is not set
    // Allow access if createdBy matches user email OR user id OR if createdBy is not set
    if (!isSuperAdmin) {
      const userEmail = session.user.email;
      const userId = session.user.id;
      const createdBy = event.createdBy;
      
      // Allow if no createdBy restriction, or if it matches current user
      if (createdBy && createdBy !== userEmail && createdBy !== userId) {
        return NextResponse.json({ error: "Unauthorized access to this event" }, { status: 403 });
      }
    }

    // Get all bookings for this event
    const bookings = await db
      .collection("bookings")
      .find({ eventId: toObjectId(eventId) })
      .toArray();

    // Enrich booking data with user info and verification status
    const enrichedBookings = await Promise.all(
      bookings.map(async (booking: any) => {
        // Get user info
        const user = await db
          .collection("users")
          .findOne({ email: booking.userEmail });

        // Get verification status from Redis
        let verified = false;
        let scannedAt: string | undefined;
        let scannedBy: string | undefined;

        if (booking.qrCodeToken) {
          const qrData = await getQRCodeData(booking.qrCodeToken);
          if (qrData && qrData.scanned) {
            verified = true;
            scannedAt = qrData.scannedAt;
            scannedBy = qrData.scannedBy;
          }
        }

        return {
          id: booking._id.toString(),
          userEmail: booking.userEmail,
          userName:
            `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
            "Unknown",
          verified,
          scannedAt,
          scannedBy,
          createdAt: booking.createdAt?.toISOString() || new Date().toISOString(),
          qrCodeToken: booking.qrCodeToken,
          teamName: booking.teamName,
          teamDetails: booking.teamDetails,
        };
      })
    );

    return NextResponse.json({
      id: event._id.toString(),
      eventName: event.eventName,
      date: event.date,
      venue: event.venue,
      category: event.category,
      price: event.price,
      description: event.description,
      timeline: event.timeline,
      performers: event.performers,
      bookings: enrichedBookings,
      pptUrl: event.pptUrl,
      pptTitle: event.pptTitle,
      timelineDocument: event.timelineDocument,
    });
  } catch (error) {
    console.error("Error fetching event details:", error);
    return NextResponse.json(
      { error: "Failed to fetch event details" },
      { status: 500 }
    );
  }
}
