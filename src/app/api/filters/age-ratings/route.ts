import { NextResponse } from 'next/server';
import { getDb, transformMongoDocuments } from '@/lib/mongodb-server';

export async function GET() {
  try {
    const db = await getDb();
    const ageRatings = await db.collection('ageRatings')
      .find({ isActive: true })
      .sort({ position: 1 })
      .toArray();

    return NextResponse.json(transformMongoDocuments(ageRatings));
  } catch (error) {
    console.error('Error fetching age ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch age ratings' },
      { status: 500 }
    );
  }
}
