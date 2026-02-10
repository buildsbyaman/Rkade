import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { isUserSuperAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/mongodb-server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isUserSuperAdmin(session.user.email, session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const db = await getDb();
    const settings = await db.collection("settings").findOne({ id: "system_config" });

    // Return default settings if none found
    if (!settings) {
      return NextResponse.json({
        platformName: "Rkade",
        supportEmail: "contact@rkade.in",
        footerText: "© 2026 RKADE. ALL RIGHTS RESERVED.",
        maintenanceMode: false,
        instagram: "@rkade.in",
        twitter: "@rkade_hq",
        linkedin: "rkade-official"
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !isUserSuperAdmin(session.user.email, session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const db = await getDb();

    await db.collection("settings").updateOne(
      { id: "system_config" },
      { 
        $set: { 
          ...body, 
          updatedAt: new Date(),
          updatedBy: session.user.id
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ message: "Settings synchronized successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
