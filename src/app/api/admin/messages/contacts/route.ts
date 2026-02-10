import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getDb } from "@/lib/mongodb-server";

// GET - List all staff members and admins that can be messaged
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const userEmail = session.user.email;

    // Fetch all users who are ADMIN, SUPER_ADMIN, LO, or MODERATOR (exclude current user)
    const contacts = await db
      .collection("users")
      .find({
        role: { $in: ["ADMIN", "SUPER_ADMIN", "LO", "MODERATOR"] },
        email: { $ne: userEmail },
      })
      .project({
        _id: 1,
        email: 1,
        firstName: 1,
        lastName: 1,
        role: 1,
      })
      .sort({ role: 1, firstName: 1 })
      .toArray();

    const formatted = contacts.map((c) => ({
      id: c._id.toString(),
      email: c.email,
      name: `${c.firstName || ""} ${c.lastName || ""}`.trim() || c.email,
      role: c.role,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
