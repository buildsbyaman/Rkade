import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isUserAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/mongodb-server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isUserAdmin(session.user.email, session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = await getDb();
    
    // Get counts
    const totalUsers = await db.collection("users").countDocuments();
    const totalEvents = await db.collection("events").countDocuments();
    const totalBookings = await db.collection("bookings").countDocuments();
    
    // Calculate simple revenue (assuming price is stored or needs to be parsed)
    // For now, let's just get the count of paid bookings or similar
    // This part is simplified
    const revenue = await db.collection("bookings").countDocuments({ status: "confirmed" });

    return NextResponse.json({
      totalUsers,
      totalEvents,
      totalBookings,
      revenue: `₹${revenue * 499}`, // Mock calculation based on a fixed price for now
      growth: "+5.2%" // Mock growth
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
