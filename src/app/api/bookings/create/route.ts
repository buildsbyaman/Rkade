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
    const {
      eventId,
      quantity = 1,
      amountPaise = 0,
      paymentId,
      orderId,
      teamDetails,
      teamName,
    } = body as {
      eventId: string;
      quantity?: number;
      amountPaise?: number;
      paymentId?: string;
      orderId?: string;
      teamDetails?: Array<{ name: string; phone: string; isLeader?: boolean }>;
      teamName?: string;
    };

    if (!eventId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { message: "Invalid booking data" },
        { status: 400 },
      );
    }

    const db = await getDb();

    // Verify event exists
    const event = await db
      .collection("events")
      .findOne({ _id: toObjectId(eventId) });

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    // Get user details - create if not exists
    let user = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!user) {
      // Create user automatically if they don't exist
      const newUser = {
        email: session.user.email,
        firstName: session.user.name?.split(" ")[0] || "User",
        lastName: session.user.name?.split(" ").slice(1).join(" ") || "",
        countryCode: "+91",
        phoneNumber: "",
        country: "",
        currentCity: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userResult = await db.collection("users").insertOne(newUser);
      user = await db
        .collection("users")
        .findOne({ _id: userResult.insertedId });
    }

    // Final check to ensure user exists
    if (!user) {
      return NextResponse.json(
        { message: "Failed to create or find user" },
        { status: 500 },
      );
    }

    // Create booking
    const bookingData = {
      eventId: toObjectId(eventId),
      userEmail: session.user.email,
      userId: user._id,
      userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      eventName: event.event_name || event.eventName,
      quantity,
      amountPaise,
      status: amountPaise > 0 ? "pending" : "confirmed",
      paymentId: paymentId || null,
      orderId: orderId || null,
      teamDetails: teamDetails || [], 
      teamName: teamName || null,
      qrCode: generateQRCode(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(bookingData);

    const booking = transformMongoDocument<{
      id: string;
      status: string;
      qrCode: string;
    }>(await db.collection("bookings").findOne({ _id: result.insertedId }));

    // Send confirmation email only if status is confirmed (i.e., paid or free/pending handling)
    // NOTE: For paid events, usually we wait for webhook. But here if amountPaise > 0, status is pending.
    // If it is pending, we might NOT want to send the CONFIRMATION email yet.
    // However, the current logic sets status to 'pending' if amountPaise > 0.
    // Let's only send if status is 'confirmed'.

    // Actually, looking at the code: status: amountPaise > 0 ? "pending" : "confirmed"
    // So if it's a direct booking (amountPaise 0?), it's confirmed.

    console.log("Booking created. Status:", booking.status);

    if (booking.status === "confirmed") {
      const safeEventName =
        event.eventName ||
        event.event_name ||
        event.title ||
        event.name ||
        "Unknown Event";

      try {
        const { sendBookingConfirmation } = await import("@/lib/email");
        await sendBookingConfirmation({
          userEmail: session.user.email,
          userName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          eventName: safeEventName,
          ticketQuantity: quantity,
          bookingId: booking.id,
          eventDate: event.date
            ? new Date(event.date).toLocaleDateString()
            : undefined,
          eventTime: event.time,
          venue: event.venue,
          qrCode: booking.qrCode,
        });
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }
    }

    return NextResponse.json(
      { booking, message: "Booking created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { message: "Error creating booking", error: String(error) },
      { status: 500 },
    );
  }
}
