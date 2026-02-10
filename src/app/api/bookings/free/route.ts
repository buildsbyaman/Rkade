import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import {
  getDb,
  toObjectId,
  transformMongoDocument,
} from "@/lib/mongodb-server";
import { generateQRCode } from "@/lib/bookings";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { eventId, quantity = 1 } = body as {
      eventId: string;
      quantity?: number;
    };

    if (!eventId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { message: "Invalid booking data" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const result = await db.collection("bookings").insertOne({
      eventId: toObjectId(eventId),
      userEmail: session.user.email,
      quantity,
      amountPaise: 0,
      status: "confirmed",
      qrCode: generateQRCode(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const booking = transformMongoDocument<{ id: string; status: string; qrCode: string }>(
      await db.collection("bookings").findOne({ _id: result.insertedId }),
    );

    // Fetch event details for email
    const event = await db.collection("events").findOne({ _id: toObjectId(eventId) });
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (event && user) {
      const safeEventName = event.eventName || event.event_name || event.title || event.name || "Unknown Event";

      try {
        const { sendBookingConfirmation } = await import('@/lib/email');
        await sendBookingConfirmation({
          userEmail: session.user.email,
          userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          eventName: safeEventName,
          ticketQuantity: quantity,
          bookingId: booking.id,
          eventDate: event.date ? new Date(event.date).toLocaleDateString() : undefined,
          eventTime: event.time,
          venue: event.venue,
          qrCode: booking.qrCode,
        });
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
      }
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating free booking", error },
      { status: 500 },
    );
  }
}
