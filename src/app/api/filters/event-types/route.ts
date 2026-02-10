import { NextResponse } from 'next/server';
import { getDb, transformMongoDocuments } from '@/lib/mongodb-server';

export async function GET() {
  try {
    const db = await getDb();
    const eventTypes = await db.collection('eventTypes')
      .find({ isActive: true })
      .sort({ position: 1 })
      .toArray();

    return NextResponse.json(transformMongoDocuments(eventTypes));
  } catch (error) {
    console.error('Error fetching event types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event types' },
      { status: 500 }
    );
  }
}
