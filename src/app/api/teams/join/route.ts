import { NextRequest, NextResponse } from 'next/server';
import { joinTeamByCode } from '@/lib/teams';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { teamCode } = body;

    if (!teamCode) {
      return NextResponse.json(
        { error: 'Team code is required' },
        { status: 400 }
      );
    }

    await joinTeamByCode(teamCode, session.user.email);

    return NextResponse.json({ success: true, message: 'Successfully joined team' });
  } catch (error) {
    // ...existing code...
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to join team' },
      { status: 500 }
    );
  }
}