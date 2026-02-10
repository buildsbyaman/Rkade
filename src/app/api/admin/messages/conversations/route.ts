import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb } from "@/lib/mongodb-server";

// GET - List conversations (grouped by contact) for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;
    const db = await getDb();

    // Get all personal messages involving this user + all broadcasts
    const messages = await db
      .collection("messages")
      .find({
        $or: [
          { senderEmail: userEmail, isBroadcast: { $ne: true } },
          { recipientEmail: userEmail, isBroadcast: { $ne: true } },
          { isBroadcast: true },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Group personal messages by conversation partner
    const conversationMap = new Map<
      string,
      {
        contactEmail: string;
        contactName: string;
        contactRole: string;
        lastMessage: any;
        unreadCount: number;
        messageCount: number;
      }
    >();

    // Separate broadcasts
    const broadcasts: any[] = [];

    for (const msg of messages) {
      if (msg.isBroadcast) {
        broadcasts.push({
          id: msg._id.toString(),
          senderEmail: msg.senderEmail,
          senderName: msg.senderName,
          senderRole: msg.senderRole,
          subject: msg.subject,
          message: msg.message,
          isRead: msg.isRead,
          isBroadcast: true,
          createdAt: msg.createdAt,
          readAt: msg.readAt,
        });
        continue;
      }

      // Determine the other party
      const isIncoming = msg.recipientEmail === userEmail;
      const contactEmail = isIncoming ? msg.senderEmail : msg.recipientEmail;
      const contactName = isIncoming ? msg.senderName : msg.recipientName;
      const contactRole = isIncoming
        ? msg.senderRole
        : msg.recipientRole || "STAFF";

      if (!contactEmail) continue;

      const existing = conversationMap.get(contactEmail);
      if (!existing) {
        conversationMap.set(contactEmail, {
          contactEmail,
          contactName: contactName || contactEmail,
          contactRole,
          lastMessage: {
            id: msg._id.toString(),
            message: msg.message,
            subject: msg.subject,
            senderEmail: msg.senderEmail,
            createdAt: msg.createdAt,
            isRead: msg.isRead,
          },
          unreadCount: isIncoming && !msg.isRead ? 1 : 0,
          messageCount: 1,
        });
      } else {
        existing.messageCount++;
        if (isIncoming && !msg.isRead) {
          existing.unreadCount++;
        }
        // lastMessage already set from the first (most recent due to sort)
      }
    }

    // Convert to array and sort by most recent message
    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime()
    );

    // Count unread broadcasts
    const unreadBroadcasts = broadcasts.filter((b) => !b.isRead).length;

    return NextResponse.json({
      conversations,
      broadcasts: broadcasts.slice(0, 50),
      unreadBroadcasts,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
