import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isUserAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/mongodb-server";

// GET - List all staff members (LOs and Moderators)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isUserAdmin(session.user.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const db = await getDb();
    const query: any = {
      role: { $in: role ? [role] : ['LO', 'MODERATOR'] }
    };

    const staff = await db
      .collection("users")
      .find(query)
      .project({
        password: 0,
      })
      .toArray();

    // Get task counts for each staff member
    const staffWithStats = await Promise.all(
      staff.map(async (member) => {
        const activeTasks = await db.collection("tasks").countDocuments({
          assignedTo: member._id.toString(),
          status: { $in: ['pending', 'in-progress'] }
        });

        const completedTasks = await db.collection("tasks").countDocuments({
          assignedTo: member._id.toString(),
          status: 'completed'
        });

        const assignments = await db.collection("assignments").find({
          userId: member._id.toString(),
          status: 'active'
        }).toArray();

        return {
          id: member._id.toString(),
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
          role: member.role,
          phone: member.phoneNumber,
          assignedEvents: assignments.map((a: any) => a.eventId.toString()),
          activeTasks,
          completedTasks,
          createdAt: member.createdAt,
        };
      })
    );

    return NextResponse.json(staffWithStats);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}
// POST - Create new staff member
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
    const { email, firstName, lastName, role, phoneNumber, countryCode, country, currentCity } = data;

    if (!email || !firstName || !lastName || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (role !== 'LO' && role !== 'MODERATOR') {
      return NextResponse.json({ error: "Invalid role. Must be LO or MODERATOR" }, { status: 400 });
    }

    const db = await getDb();
    const { ObjectId } = await import("mongodb");

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
    }

    const newStaff = {
      _id: new ObjectId(),
      email,
      password: "$2a$12$default.staff.password.hash", // Default password - should be changed on first login
      firstName,
      lastName,
      role,
      phoneNumber: phoneNumber || null,
      countryCode: countryCode || "+91",
      country: country || "India",
      currentCity: currentCity || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").insertOne(newStaff);

    return NextResponse.json({
      id: newStaff._id.toString(),
      email: newStaff.email,
      firstName: newStaff.firstName,
      lastName: newStaff.lastName,
      role: newStaff.role,
      phone: newStaff.phoneNumber,
      assignedEvents: [],
      activeTasks: 0,
      completedTasks: 0,
      createdAt: newStaff.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating staff member:", error);
    return NextResponse.json(
      { error: "Failed to create staff member" },
      { status: 500 }
    );
  }
}