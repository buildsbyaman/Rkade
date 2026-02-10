import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb, toObjectId } from "@/lib/mongodb-server";
import { storeQRCode, QRCodeData } from "@/lib/redis";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 },
      );
    }

    const db = await getDb();

    // Get booking details
    const booking = await db.collection("bookings").findOne({
      _id: toObjectId(bookingId),
      userEmail: session.user.email,
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if QR code already exists for this booking
    if (booking.qrCodeToken) {
      return NextResponse.json({
        qrCodeToken: booking.qrCodeToken,
        message: "QR code already exists for this booking",
        alreadyExists: true,
      });
    }

    // Get event details
    const event = await db.collection("events").findOne({
      _id: toObjectId(booking.eventId),
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get user details
    const user = await db.collection("users").findOne({
      email: session.user.email,
    });

    // Generate unique QR code token
    const qrCodeToken = uuidv4();

    // Prepare QR code data
    const qrCodeData: QRCodeData = {
      bookingId: booking._id.toString(),
      userId: user?._id.toString() || "",
      userEmail: session.user.email,
      eventId: event._id.toString(),
      eventName: event.event_name || "Event",
      eventDate: event.date || "TBA",
      eventVenue: event.venue || "TBA",
      userName: user?.name || session.user.name || "User",
      bookingDate: booking.createdAt || new Date().toISOString(),
      scanned: false,
    };

    // Store in Redis with 48-hour expiry
    await storeQRCode(qrCodeToken, qrCodeData, 48);

    // Store QR code token in MongoDB for reference
    await db
      .collection("bookings")
      .updateOne({ _id: toObjectId(bookingId) }, { $set: { qrCodeToken } });

    return NextResponse.json({
      qrCodeToken,
      qrCodeData,
      message: "QR code generated successfully",
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 },
    );
  }
}
