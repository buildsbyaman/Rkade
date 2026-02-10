import { NextRequest, NextResponse } from 'next/server';
import { leaveTeam, deleteTeam } from '@/lib/teams';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';

// Leave a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { teamId } = await params;
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'delete') {
      // Delete the entire team (creator only)
      await deleteTeam(teamId, session.user.email);
      return NextResponse.json({ success: true, message: 'Team deleted successfully' });
    } else {
      // Leave the team
      await leaveTeam(teamId, session.user.email);
      return NextResponse.json({ success: true, message: 'Left team successfully' });
    }
  } catch (error) {
    // ...existing code...
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Operation failed' },
      { status: 500 }
    );
  }
}