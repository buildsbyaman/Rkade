import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isUserSuperAdmin } from "@/lib/admin-auth";
import { getDb, toObjectId } from "@/lib/mongodb-server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isUserSuperAdmin(session.user.email, session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = await getDb();
    const admins = await db
      .collection("users")
      .find({ role: { $in: ["ADMIN", "SUPER_ADMIN"] } })
      .project({ password: 0 }) // Don't return passwords
      .toArray();

    const formattedAdmins = admins.map(admin => ({
      ...admin,
      id: admin._id.toString()
    }));

    return NextResponse.json(formattedAdmins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isUserSuperAdmin(session.user.email, session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    const db = await getDb();
    
    // Check if user exists
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user role
    await db.collection("users").updateOne(
      { _id: user._id },
      { $set: { role, updatedAt: new Date() } }
    );

    return NextResponse.json({ message: "Admin updated successfully" });
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isUserSuperAdmin(session.user.email, session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, role } = await request.json();

    if (!id || !role) {
      return NextResponse.json({ error: "ID and role are required" }, { status: 400 });
    }

    const db = await getDb();
    
    await db.collection("users").updateOne(
      { _id: toObjectId(id) },
      { $set: { role, updatedAt: new Date() } }
    );

    return NextResponse.json({ message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
    try {
      const session = await getServerSession(authOptions);
  
      if (!session || !isUserSuperAdmin(session.user.email, session.user.role)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
  
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
  
      if (!id) {
        return NextResponse.json({ error: "ID is required" }, { status: 400 });
      }
  
      const db = await getDb();
      
      // Instead of deleting, we demote to USER for safety, 
      // or we can delete if explicitly needed. 
      // Let's demote to USER.
      await db.collection("users").updateOne(
        { _id: toObjectId(id) },
        { $set: { role: "USER", updatedAt: new Date() } }
      );
  
      return NextResponse.json({ message: "Admin demoted successfully" });
    } catch (error) {
      console.error("Error demoting admin:", error);
      return NextResponse.json({ error: "Failed to demote admin" }, { status: 500 });
    }
  }
