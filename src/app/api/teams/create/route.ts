import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { createTeam, CreateTeamInput } from "@/lib/teams";
import { createBooking } from "@/lib/bookings";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { eventId, teamName } = await req.json();

        if (!eventId || !teamName) {
            return NextResponse.json(
                { error: "Missing eventId or teamName" },
                { status: 400 }
            );
        }

        // Create the team
        const team = await createTeam({
            eventId,
            teamName,
            creatorEmail: session.user.email,
        });

        // Create a booking for the team creator
        const booking = await createBooking(eventId, session.user.email, team.id);

        return NextResponse.json({
            success: true,
            team,
            booking,
        });
    } catch (error: any) {
        // ...existing code...
        return NextResponse.json(
            { error: error.message || "Failed to create team" },
            { status: 500 }
        );
    }
}
