import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import {
  getDb,
  transformMongoDocuments,
  toObjectId,
} from "@/lib/mongodb-server";

// ... imports
import { generateQRCode } from "@/lib/bookings";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.error("Unauthorized: No user email provided in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();

    // Get user from database
    const user = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!user) {
      console.error("User not found in database");
      // If user is not in DB, they have no bookings. Return empty array.
      return NextResponse.json([]);
    }

    console.log(`Fetching bookings for user: ${user.email}`);

    // Get bookings with event details using aggregation
    const bookings = await db
      .collection("bookings")
      .aggregate([
        { $match: { userEmail: session.user.email } },
        {
          $lookup: {
            from: "events",
            localField: "eventId",
            foreignField: "_id",
            as: "event",
          },
        },
        { $unwind: { path: "$event", preserveNullAndEmptyArrays: true } },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    // Self-healing: Check for missing QR codes and generate/save them if needed
    const updates = bookings.map(async (booking) => {
      if (!booking.qrCode) {
        console.log(`Generating missing QR code for booking ${booking._id}`);
        const newQrCode = generateQRCode();

        // Update database
        await db.collection("bookings").updateOne(
          { _id: booking._id },
          { $set: { qrCode: newQrCode } }
        );

        // Update local object so the UI gets it immediately
        booking.qrCode = newQrCode;
      }
    });

    // Wait for all updates to complete
    await Promise.all(updates);

    console.log(`Found ${bookings?.length || 0} bookings`);
    return NextResponse.json(transformMongoDocuments(bookings));
  } catch (error) {
    console.error("Server error in /api/bookings/user:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 },
    );
  }
}
