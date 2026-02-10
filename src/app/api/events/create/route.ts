import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createEvent } from '@/lib/event';
import { authOptions } from '@/lib/auth-config';
import { isUserAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!isUserAdmin(session.user.email)) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const event = await createEvent({
      ...body,
      creatorEmail: session.user.email
    });
    return NextResponse.json({ message: 'Event created', event }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating event', error }, { status: 500 });
  }
}
