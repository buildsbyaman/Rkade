import { NextResponse } from 'next/server';
import { getDb, transformMongoDocuments } from '@/lib/mongodb-server';

export async function GET() {
  try {
    const db = await getDb();
    const categories = await db.collection('categories')
      .find({ isActive: true })
      .sort({ position: 1 })
      .toArray();

    return NextResponse.json(transformMongoDocuments(categories));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
