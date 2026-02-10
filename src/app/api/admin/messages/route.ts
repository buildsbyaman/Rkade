import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb, toObjectId } from "@/lib/mongodb-server";
import { ObjectId } from "mongodb";

// GET - List messages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const userId = searchParams.get("userId");

    const db = await getDb();
    const query: any = {
      $or: [
        { senderEmail: session.user.email },
        { recipientEmail: session.user.email },
        { isBroadcast: true },
      ],
    };

    if (eventId) {
      // When filtering by eventId, first find messages for this event,
      // then also find all replies between the same participants (even without eventId)
      const eventOid = toObjectId(eventId);
      const eventMessages = await db
        .collection("messages")
        .find({ eventId: eventOid })
        .toArray();

      // Collect all unique conversation partner emails from event messages
      const partnerEmails = new Set<string>();
      for (const msg of eventMessages) {
        if (msg.senderEmail && msg.senderEmail !== session.user.email) {
          partnerEmails.add(msg.senderEmail);
        }
        if (msg.recipientEmail && msg.recipientEmail !== session.user.email) {
          partnerEmails.add(msg.recipientEmail);
        }
      }

      // Build query: messages with this eventId OR messages between admin and those partners
      const partners = Array.from(partnerEmails);
      if (partners.length > 0) {
        query.$or = [
          { eventId: eventOid },
          {
            isBroadcast: { $ne: true },
            $or: [
              { senderEmail: session.user.email, recipientEmail: { $in: partners } },
              { recipientEmail: session.user.email, senderEmail: { $in: partners } },
            ],
          },
          { isBroadcast: true, eventId: eventOid },
        ];
      } else {
        query.eventId = eventOid;
      }
    }

    if (userId) {
      query.$or = [
        { senderId: userId, recipientId: session.user.id },
        { senderId: session.user.id, recipientId: userId },
      ];
    }

    const messages = await db
      .collection("messages")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    const formattedMessages = messages.map((msg) => ({
      id: msg._id.toString(),
      eventId: msg.eventId?.toString(),
      senderId: msg.senderId,
      senderEmail: msg.senderEmail,
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      recipientId: msg.recipientId,
      recipientEmail: msg.recipientEmail,
      recipientName: msg.recipientName,
      recipientRole: msg.recipientRole,
      subject: msg.subject,
      message: msg.message,
      isRead: msg.isRead,
      isBroadcast: msg.isBroadcast,
      createdAt: msg.createdAt,
      readAt: msg.readAt,
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Send message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { 
      eventId, 
      recipientId, 
      recipientEmail, 
      recipientName, 
      recipientRole,
      subject, 
      message, 
      isBroadcast 
    } = data;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!isBroadcast && !recipientEmail) {
      return NextResponse.json({ error: "Recipient is required for non-broadcast messages" }, { status: 400 });
    }

    const db = await getDb();

    const messageDoc = {
      _id: new ObjectId(),
      eventId: eventId ? toObjectId(eventId) : null,
      senderId: (session.user as any).id || session.user.email,
      senderEmail: session.user.email,
      senderName: session.user.name || session.user.email,
      senderRole: (session.user as any).role || 'ADMIN',
      recipientId: recipientId || null,
      recipientEmail: recipientEmail || null,
      recipientName: recipientName || null,
      recipientRole: recipientRole || null,
      subject: subject || null,
      message,
      isRead: false,
      isBroadcast: isBroadcast || false,
      createdAt: new Date().toISOString(),
      readAt: null,
    };

    await db.collection("messages").insertOne(messageDoc);

    return NextResponse.json({
      id: messageDoc._id.toString(),
      ...messageDoc,
      eventId: messageDoc.eventId?.toString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// PATCH - Mark message as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { messageId } = data;

    if (!messageId) {
      return NextResponse.json({ error: "Missing message ID" }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.collection("messages").updateOne(
      { 
        _id: toObjectId(messageId),
        recipientEmail: session.user.email 
      },
      { 
        $set: { 
          isRead: true, 
          readAt: new Date().toISOString() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking message as read:", error);
    return NextResponse.json(
      { error: "Failed to update message" },
      { status: 500 }
    );
  }
}
