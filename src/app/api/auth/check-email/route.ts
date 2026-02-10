import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json({ exists: false });
  }
  const user = await getUserByEmail(email);
  return NextResponse.json({ exists: !!user });
}
