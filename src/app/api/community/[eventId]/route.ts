import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { ObjectId } from "mongodb";

// GET - Fetch community messages for an event
export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
    const db = await getDb();

    // Verify user has a confirmed booking for this event
    const booking = await db.collection("bookings").findOne({
      eventId: new ObjectId(eventId),
      userEmail: session.user.email,
      status: "confirmed",
    });

    if (!booking) {
      return NextResponse.json(
        { error: "You must have a confirmed booking to access the community" },
        { status: 403 }
      );
    }

    // Fetch messages
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const messages = await db
      .collection("community_messages")
      .find({ eventId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db
      .collection("community_messages")
      .countDocuments({ eventId });

    // Transform ObjectId to string
    const transformed = messages.map((msg) => ({
      id: msg._id.toString(),
      eventId: msg.eventId,
      userEmail: msg.userEmail,
      userName: msg.userName,
      userImage: msg.userImage || null,
      message: msg.message,
      imageUrl: msg.imageUrl || null,
      isAdminMention: msg.isAdminMention || false,
      isAdminReply: msg.isAdminReply || false,
      createdAt: msg.createdAt,
    }));

    return NextResponse.json({
      messages: transformed,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    console.error("Error fetching community messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST - Send a community message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId } = await params;
    const db = await getDb();

    // Check if user is admin/creator of the event
    const event = await db.collection("events").findOne({
      _id: new ObjectId(eventId),
    });

    const isAdmin =
      event?.creatorEmail === session.user.email ||
      session.user.email === "admin@rkade.com";

    // Verify user has a confirmed booking (or is admin)
    if (!isAdmin) {
      const booking = await db.collection("bookings").findOne({
        eventId: new ObjectId(eventId),
        userEmail: session.user.email,
        status: "confirmed",
      });

      if (!booking) {
        return NextResponse.json(
          { error: "You must have a confirmed booking to post in the community" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { message, imageUrl } = body;

    if (!message && !imageUrl) {
      return NextResponse.json(
        { error: "Message or image is required" },
        { status: 400 }
      );
    }

    if (message && message.length > 1000) {
      return NextResponse.json(
        { error: "Message too long (max 1000 chars)" },
        { status: 400 }
      );
    }

    // Check for @admin mention
    const isAdminMention = message?.includes("@admin") || false;

    const newMessage = {
      eventId,
      userEmail: session.user.email,
      userName: session.user.name || session.user.email.split("@")[0],
      userImage: session.user.image || null,
      message: message || "",
      imageUrl: imageUrl || null,
      isAdminMention,
      isAdminReply: isAdmin,
      createdAt: new Date(),
    };

    const result = await db
      .collection("community_messages")
      .insertOne(newMessage);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...newMessage,
    });
  } catch (error) {
    console.error("Error posting community message:", error);
    return NextResponse.json(
      { error: "Failed to post message" },
      { status: 500 }
    );
  }
}
