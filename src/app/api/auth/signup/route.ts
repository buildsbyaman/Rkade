import { NextRequest, NextResponse } from 'next/server';
import { signUpSchema } from '@/lib/schemas';
import { createUser, getUserByEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = signUpSchema.parse(body);

    // Check if user already exists
    const existingUser = await getUserByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Create new user
    const user = await createUser({
      email: validatedData.email,
      password: validatedData.password,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      countryCode: validatedData.countryCode,
      phoneNumber: validatedData.phoneNumber,
      country: validatedData.country,
      currentCity: validatedData.currentCity,
      birthday: validatedData.birthday ? new Date(validatedData.birthday) : undefined,
      gender: validatedData.gender,
      profilePictureUrl: validatedData.profilePictureUrl,
      address: validatedData.address,
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Failed to create user' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Sign up error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}