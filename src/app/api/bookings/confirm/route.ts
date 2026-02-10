import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb, toObjectId } from "@/lib/mongodb-server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, paymentId, orderId } = body as {
      bookingId: string;
      paymentId: string;
      orderId: string;
    };

    if (!bookingId || !paymentId || !orderId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    const db = await getDb();

    // Find and update booking
    const result = await db.collection("bookings").findOneAndUpdate(
      {
        _id: toObjectId(bookingId),
        userEmail: session.user.email,
      },
      {
        $set: {
          status: "confirmed",
          paymentId,
          orderId,
          confirmedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking confirmed successfully",
      booking: result,
    });
  } catch (error) {
    console.error("Error confirming booking:", error);
    return NextResponse.json(
      { message: "Error confirming booking", error: String(error) },
      { status: 500 },
    );
  }
}
