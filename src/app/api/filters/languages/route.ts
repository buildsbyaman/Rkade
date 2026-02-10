import { NextResponse } from 'next/server';
import { getDb, transformMongoDocuments } from '@/lib/mongodb-server';

export async function GET() {
  try {
    const db = await getDb();
    const languages = await db.collection('languages')
      .find({ isActive: true })
      .sort({ position: 1 })
      .toArray();

    return NextResponse.json(transformMongoDocuments(languages));
  } catch (error) {
    console.error('Error fetching languages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 }
    );
  }
}
