import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb } from "@/lib/mongodb-server";

// GET - Fetch message thread between current user and a contact
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contactEmail: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contactEmail } = await params;
    const decodedEmail = decodeURIComponent(contactEmail);
    const userEmail = session.user.email;
    const db = await getDb();

    // Fetch all messages between these two users (both directions), sorted oldest first
    const messages = await db
      .collection("messages")
      .find({
        isBroadcast: { $ne: true },
        $or: [
          { senderEmail: userEmail, recipientEmail: decodedEmail },
          { senderEmail: decodedEmail, recipientEmail: userEmail },
        ],
      })
      .sort({ createdAt: 1 })
      .limit(200)
      .toArray();

    const formatted = messages.map((msg) => ({
      id: msg._id.toString(),
      senderEmail: msg.senderEmail,
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      recipientEmail: msg.recipientEmail,
      recipientName: msg.recipientName,
      recipientRole: msg.recipientRole,
      subject: msg.subject,
      message: msg.message,
      isRead: msg.isRead,
      isBroadcast: false,
      createdAt: msg.createdAt,
      readAt: msg.readAt,
    }));

    // Mark unread messages where current user is recipient as read
    await db.collection("messages").updateMany(
      {
        recipientEmail: userEmail,
        senderEmail: decodedEmail,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date().toISOString(),
        },
      }
    );

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching thread:", error);
    return NextResponse.json(
      { error: "Failed to fetch thread" },
      { status: 500 }
    );
  }
}
