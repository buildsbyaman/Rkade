import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isUserAdmin } from "@/lib/admin-auth";
import { getDb, toObjectId } from "@/lib/mongodb-server";
import { ObjectId } from "mongodb";

// GET - List all tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const assignedTo = searchParams.get("assignedTo");
    const status = searchParams.get("status");

    const db = await getDb();
    const query: any = {};
    
    if (eventId) query.eventId = toObjectId(eventId);
    if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;

    const tasks = await db
      .collection("tasks")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Fetch event details for each task
    const formattedTasks = await Promise.all(tasks.map(async (task) => {
      // Ensure eventId is an ObjectId for the query
      let eventQuery;
      if (task.eventId instanceof ObjectId) {
        eventQuery = { _id: task.eventId };
      } else {
        eventQuery = { _id: toObjectId(task.eventId) };
      }
      
      const event = await db.collection("events").findOne(eventQuery);
      
      return {
        id: task._id.toString(),
        eventId: task.eventId.toString(),
        eventTitle: event?.title || event?.eventName || "Unknown Event",
        eventSlug: event?.slug || "",
        assignedTo: task.assignedTo,
        assignedToEmail: task.assignedToEmail,
        assignedToName: task.assignedToName,
        assignedToRole: task.assignedToRole,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        venue: task.venue,
        session: task.session,
        createdBy: task.createdBy,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        completedAt: task.completedAt,
        notes: task.notes,
      };
    }));

    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST - Create new task
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
    const { 
      eventId, 
      assignedTo, 
      assignedToEmail, 
      assignedToName, 
      assignedToRole,
      title, 
      description, 
      priority, 
      dueDate, 
      venue, 
      session: sessionName 
    } = data;

    if (!eventId || !assignedTo || !assignedToEmail || !assignedToName || !title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const db = await getDb();

    const task = {
      _id: new ObjectId(),
      eventId: toObjectId(eventId),
      assignedTo,
      assignedToEmail,
      assignedToName,
      assignedToRole: assignedToRole || 'LO',
      title,
      description,
      priority: priority || 'medium',
      status: 'pending',
      dueDate: dueDate || null,
      venue: venue || null,
      session: sessionName || null,
      createdBy: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      notes: null,
    };

    await db.collection("tasks").insertOne(task);

    return NextResponse.json({
      id: task._id.toString(),
      ...task,
      eventId: task.eventId.toString(),
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}

// PATCH - Update task status or details
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { taskId, status, notes, ...otherUpdates } = data;

    if (!taskId) {
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
    }

    const db = await getDb();

    const updateData: any = {
      ...otherUpdates,
      updatedAt: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const result = await db.collection("tasks").updateOne(
      { _id: toObjectId(taskId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE - Remove task
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
    const taskId = searchParams.get("id");

    if (!taskId) {
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
    }

    const db = await getDb();

    const result = await db.collection("tasks").deleteOne({
      _id: toObjectId(taskId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
