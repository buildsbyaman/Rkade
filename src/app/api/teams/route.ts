import { NextRequest, NextResponse } from 'next/server';
import { createTeam, getTeamsForEvent, getUserTeamForEvent } from '@/lib/teams';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, teamName } = body;

    if (!eventId || !teamName) {
      return NextResponse.json(
        { error: 'Event ID and team name are required' },
        { status: 400 }
      );
    }

    // Check if user already has a team for this event
    const existingTeam = await getUserTeamForEvent(eventId, session.user.email);
    if (existingTeam) {
      return NextResponse.json(
        { error: 'You are already part of a team for this event' },
        { status: 400 }
      );
    }

    const team = await createTeam({
      eventId,
      teamName,
      creatorEmail: session.user.email,
    });

    return NextResponse.json({ team });
  } catch (error) {
    // ...existing code...
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create team' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const userEmail = searchParams.get('userEmail');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // If userEmail is provided, get the user's specific team
    if (userEmail) {
      const userTeam = await getUserTeamForEvent(eventId, userEmail);
      return NextResponse.json({ userTeam });
    }

    // Otherwise, get all teams for the event
    const teams = await getTeamsForEvent(eventId);
    return NextResponse.json({ teams });
  } catch (error) {
    // ...existing code...
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}