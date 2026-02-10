import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isUserAdmin } from "@/lib/admin-auth";
import { canAccessStaffRoutes } from "@/lib/staff-auth";
import { getDb, toObjectId } from "@/lib/mongodb-server";
import { ObjectId } from "mongodb";

// GET - List all assignments for an event
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
    let query: any = {};

    // Staff members can only see their own assignments
    const isAdmin = isUserAdmin(session.user.email);
    const isStaff = canAccessStaffRoutes((session.user as any).role);

    if (!isAdmin && !isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build query based on user role
    if (eventId) {
      query.eventId = toObjectId(eventId);
    }

    if (userId || !isAdmin) {
      // If userId is provided OR user is staff (not admin), filter by userId
      const targetUserId = userId || (session.user as any).id || session.user.email;
      query.userId = targetUserId;
    }
    
    const assignments = await db
      .collection("assignments")
      .find(query)
      .sort({ assignedAt: -1 })
      .toArray();

    // Fetch event details for each assignment
    const formattedAssignments = await Promise.all(assignments.map(async (assignment) => {
      // Ensure eventId is an ObjectId for the query
      let eventQuery;
      if (assignment.eventId instanceof ObjectId) {
        eventQuery = { _id: assignment.eventId };
      } else {
        eventQuery = { _id: toObjectId(assignment.eventId) };
      }
      
      const event = await db.collection("events").findOne(eventQuery);
      
      return {
        id: assignment._id.toString(),
        eventId: assignment.eventId.toString(),
        eventTitle: event?.title || event?.eventName || "Unknown Event",
        eventSlug: event?.slug || "",
        userId: assignment.userId,
        userEmail: assignment.userEmail,
        userName: assignment.userName,
        role: assignment.role,
        venue: assignment.venue,
        session: assignment.session,
        assignedAt: assignment.assignedAt,
        assignedBy: assignment.assignedBy,
        status: assignment.status,
      };
    }));

    return NextResponse.json(formattedAssignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

// POST - Create new assignment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isUserAdmin(session.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();
    const { eventId, userId, userEmail, userName, role, venue, session: sessionName } = data;

    if (!eventId || !userId || !userEmail || !userName || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();

    const assignment = {
      _id: new ObjectId(),
      eventId: toObjectId(eventId),
      userId,
      userEmail,
      userName,
      role,
      venue: venue || null,
      session: sessionName || null,
      assignedAt: new Date().toISOString(),
      assignedBy: session.user.email,
      status: "active",
    };

    await db.collection("assignments").insertOne(assignment);

    return NextResponse.json({
      id: assignment._id.toString(),
      ...assignment,
      eventId: assignment.eventId.toString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}

// PATCH - Update assignment status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isUserAdmin(session.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();
    const { assignmentId, status } = data;

    if (!assignmentId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.collection("assignments").updateOne(
      { _id: toObjectId(assignmentId) },
      { $set: { status, updatedAt: new Date().toISOString() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

// DELETE - Remove assignment
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isUserAdmin(session.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get("id");

    if (!assignmentId) {
      return NextResponse.json({ error: "Missing assignment ID" }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.collection("assignments").deleteOne({
      _id: toObjectId(assignmentId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
