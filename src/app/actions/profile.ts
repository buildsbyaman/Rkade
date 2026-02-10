"use server";

import { getDb } from "@/lib/mongodb-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";

/**
 * Fetch the current user's profile for the Navbar (returns percentage & generic data)
 * Cached for 5 minutes to improve performance
 */
export async function getUserProfileData() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  // Cache the profile data for 5 minutes per user
  const getCachedProfile = unstable_cache(
    async (email: string) => {
      try {
        const db = await getDb();
        const user = await db.collection("users").findOne({ email });

        if (!user) {
          console.error("User not found:", email);
          return null;
        }

        // Calculate Profile Completeness
        let filledFields = 0;
        const totalFields = 6;

        if (user.firstName && user.lastName) filledFields++; // 1. Name
        if (user.email) filledFields++; // 2. Email
        if (user.phoneNumber) filledFields++; // 3. Phone
        if (user.bio && user.bio.length > 10) filledFields++; // 4. Bio
        if (user.profilePictureUrl) filledFields++; // 5. Profile Pic
        if (user.socialLinks && Object.keys(user.socialLinks).length > 0)
          filledFields++; // 6. Socials

        const percentage = Math.round((filledFields / totalFields) * 100);

        return {
          profilePictureUrl: user.profilePictureUrl || null,
          percentage,
          name:
            `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        };
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
    },
    ["user-profile"],
    {
      revalidate: 300, // Cache for 5 minutes
      tags: [`profile-${session.user.email}`],
    },
  );

  return getCachedProfile(session.user.email);
}

/**
 * Fetch the full user profile for the Profile Page
 */
export async function getUserProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Transform MongoDB document to match expected format
    const userData = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      bio: user.bio,
      birthday: user.birthday,
      gender: user.gender,
      profilePictureUrl: user.profilePictureUrl,
      socialLinks: user.socialLinks || {},
      country: user.country,
      currentCity: user.currentCity,
      preferences: user.preferences || {},
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return { success: true, data: userData };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, message: "Failed to fetch profile" };
  }
}

/**
 * Update the user profile from the Profile Page form
 */
export async function updateProfile(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: "Not authenticated" };
  }

  const rawData: any = {};

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phone = formData.get("phone") as string;
  const bio = formData.get("bio") as string;
  const birthday = formData.get("birthday") as string;
  const gender = formData.get("gender") as string;

  if (firstName) rawData.firstName = firstName;
  if (lastName) rawData.lastName = lastName;
  if (phone) rawData.phoneNumber = phone;
  if (bio) rawData.bio = bio;
  if (birthday) rawData.birthday = birthday;
  if (gender) rawData.gender = gender;

  const socialLinks: any = {};
  const instagram = formData.get("instagram") as string;
  const linkedin = formData.get("linkedin") as string;
  const twitter = formData.get("twitter") as string;
  const website = formData.get("website") as string;

  if (instagram) socialLinks.instagram = instagram;
  if (linkedin) socialLinks.linkedin = linkedin;
  if (twitter) socialLinks.twitter = twitter;
  if (website) socialLinks.website = website;

  if (Object.keys(socialLinks).length > 0) {
    rawData.socialLinks = socialLinks;
  }

  rawData.updatedAt = new Date();

  try {
    const db = await getDb();

    // First check if user exists
    const existingUser = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!existingUser) {
      // User doesn't exist - create them (for Google OAuth users who might not have been created)
      const names = session.user.name?.split(" ") || ["", ""];
      const newUser = {
        email: session.user.email,
        firstName: firstName || names[0] || "",
        lastName: lastName || names.slice(1).join(" ") || "",
        phoneNumber: phone || "",
        bio: bio || "",
        birthday: birthday || null,
        gender: gender || "",
        socialLinks: Object.keys(socialLinks).length > 0 ? socialLinks : {},
        profilePictureUrl: session.user.image || null,
        password: "", // OAuth users don't have password
        countryCode: "+1",
        country: "",
        currentCity: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection("users").insertOne(newUser);
      console.log("Created new user profile for:", session.user.email);
    } else {
      // User exists - update them
      const result = await db
        .collection("users")
        .updateOne({ email: session.user.email }, { $set: rawData });

      if (result.matchedCount === 0) {
        return { success: false, message: "User not found" };
      }
    }

    // Invalidate cache for this user
    // @ts-ignore - Next.js 16 API change compatibility
    await revalidateTag(`profile-${session.user.email}`, 'layout');
    revalidatePath("/profile");

    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      message: `Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Upload profile picture
 */
export async function uploadProfilePicture(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: "Not authenticated" };
  }

  try {
    const file = formData.get("profilePicture") as File;
    if (!file) {
      return { success: false, message: "No file provided" };
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        message: "Invalid file type. Please upload JPEG, PNG, or WebP.",
      };
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, message: "File size too large. Max 5MB." };
    }

    // For now, convert to base64 data URL (in production, upload to cloud storage)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const db = await getDb();
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          profilePictureUrl: dataUrl,
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return { success: false, message: "User not found" };
    }

    // Invalidate cache
    // @ts-ignore - Next.js 16 API change compatibility
    await revalidateTag(`profile-${session.user.email}`, 'layout');
    revalidatePath("/profile");

    return { success: true, message: "Profile picture updated successfully" };
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return { success: false, message: "Failed to upload profile picture" };
  }
}

/**
 * Change password for credentials users
 */
export async function changePassword(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: "Not authenticated" };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, message: "All fields are required" };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: "New passwords do not match" };
  }

  if (newPassword.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters",
    };
  }

  try {
    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check if user is OAuth user (no password)
    if (!user.password) {
      return {
        success: false,
        message:
          "Cannot change password for OAuth accounts. Use your OAuth provider to manage your password.",
      };
    }

    // Verify current password
    const bcrypt = require("bcryptjs");
    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return { success: false, message: "Current password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    );

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, message: "Failed to change password" };
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: "Not authenticated" };
  }

  const confirmation = formData.get("confirmation") as string;

  if (confirmation !== "DELETE") {
    return {
      success: false,
      message: 'Please type "DELETE" to confirm account deletion',
    };
  }

  try {
    const db = await getDb();

    // Delete all user-related data
    await db.collection("users").deleteOne({ email: session.user.email });

    // Optionally delete user's events, bookmarks, etc.
    // await db.collection("events").deleteMany({ creatorEmail: session.user.email });

    // Invalidate cache
    // @ts-ignore - Next.js 16 API change compatibility
    await revalidateTag(`profile-${session.user.email}`, 'layout');

    return { success: true, message: "Account deleted successfully" };
  } catch (error) {
    console.error("Error deleting account:", error);
    return { success: false, message: "Failed to delete account" };
  }
}

/**
 * Update notification preferences
 */
export async function updatePreferences(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { success: false, message: "Not authenticated" };
  }

  const emailNotifications = formData.get("emailNotifications") === "true";
  const pushNotifications = formData.get("pushNotifications") === "true";
  const eventReminders = formData.get("eventReminders") === "true";
  const newsletter = formData.get("newsletter") === "true";

  try {
    const db = await getDb();
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      {
        $set: {
          preferences: {
            emailNotifications,
            pushNotifications,
            eventReminders,
            newsletter,
          },
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return { success: false, message: "User not found" };
    }

    // Invalidate cache
    // @ts-ignore - Next.js 16 API change compatibility
    await revalidateTag(`profile-${session.user.email}`, 'layout');
    revalidatePath("/profile");

    return { success: true, message: "Preferences updated successfully" };
  } catch (error) {
    console.error("Error updating preferences:", error);
    return { success: false, message: "Failed to update preferences" };
  }
}
