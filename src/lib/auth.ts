import bcrypt from "bcryptjs";
import { getDb, transformMongoDocument } from "./mongodb-server";
import { CreateUserInput, User } from "@/types/user";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(
  userData: CreateUserInput,
): Promise<User | null> {
  try {
    const db = await getDb();

    // Only hash password if it's provided (not empty for OAuth users)
    const hashedPassword = userData.password
      ? await hashPassword(userData.password)
      : "";

    const { address } = userData;
    const result = await db.collection("users").insertOne({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      countryCode: userData.countryCode,
      phoneNumber: userData.phoneNumber,
      country: userData.country,
      currentCity: userData.currentCity,
      birthday: userData.birthday,
      gender: userData.gender,
      profilePictureUrl: userData.profilePictureUrl,
      address: {
        line1: address?.line1,
        line2: address?.line2,
        landmark: address?.landmark,
        pinCode: address?.pinCode,
        city: address?.city,
        state: address?.state,
      },
      role: userData.email === 'amankumarunofficial2810@gmail.com' ? 'SUPER_ADMIN' : 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const insertedUser = await db
      .collection("users")
      .findOne({ _id: result.insertedId });

    if (!insertedUser) {
      // ...existing code...
      return null;
    }

    return {
      id: insertedUser._id.toString(),
      email: insertedUser.email,
      firstName: insertedUser.firstName,
      lastName: insertedUser.lastName,
      countryCode: insertedUser.countryCode,
      phoneNumber: insertedUser.phoneNumber,
      country: insertedUser.country,
      currentCity: insertedUser.currentCity,
      birthday: insertedUser.birthday
        ? new Date(insertedUser.birthday)
        : undefined,
      gender: insertedUser.gender,
      profilePictureUrl: insertedUser.profilePictureUrl,
      address: insertedUser.address,
      role: insertedUser.role || 'USER',
      createdAt: new Date(insertedUser.createdAt),
      updatedAt: new Date(insertedUser.updatedAt),
    };
  } catch (error) {
    // ...existing code...
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const db = await getDb();
    const data = await db.collection("users").findOne({ email });

    if (!data) {
      return null;
    }

    return {
      id: data._id.toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      countryCode: data.countryCode,
      phoneNumber: data.phoneNumber,
      country: data.country,
      currentCity: data.currentCity,
      birthday: data.birthday ? new Date(data.birthday) : undefined,
      gender: data.gender,
      profilePictureUrl: data.profilePictureUrl,
      address: data.address,
      role: data.role || 'USER',
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  } catch (error) {
    // ...existing code...
    return null;
  }
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<User | null> {
  try {
    const db = await getDb();
    const data = await db.collection("users").findOne({ email });

    if (!data) {
      return null;
    }

    const isValidPassword = await verifyPassword(password, data.password);
    if (!isValidPassword) {
      return null;
    }

    return {
      id: data._id.toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      countryCode: data.countryCode,
      phoneNumber: data.phoneNumber,
      country: data.country,
      currentCity: data.currentCity,
      birthday: data.birthday ? new Date(data.birthday) : undefined,
      gender: data.gender,
      profilePictureUrl: data.profilePictureUrl,
      address: data.address,
      role: data.role || 'USER',
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  } catch (error) {
    // ...existing code...
    return null;
  }
}
