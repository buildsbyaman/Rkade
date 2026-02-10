"use server";

import { getDb, transformMongoDocument } from "@/lib/mongodb-server";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  eventsAttended: number;
  xp: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const db = await getDb();

    // 1. Aggregate bookings by user email to get counts
    const bookingsAgg = await db
      .collection("bookings")
      .aggregate([
        { $match: { status: { $in: ["paid", "confirmed"] } } },
        { $group: { _id: "$userEmail", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    if (bookingsAgg.length === 0) return [];

    // 2. Get user emails
    const userEmails = bookingsAgg.map((b) => b._id);

    // 3. Fetch user details
    const users = await db
      .collection("users")
      .find({ email: { $in: userEmails } })
      .toArray();

    // 4. Construct the leaderboard list
    const leaderboard = bookingsAgg
      .map((agg, index) => {
        const user = users.find((u) => u.email === agg._id);

        if (!user) return null;

        return {
          rank: index + 1,
          userId: user._id.toString(),
          firstName: user.firstName || "Unknown",
          lastName: user.lastName || "",
          profilePicture: user.profilePictureUrl || undefined,
          eventsAttended: agg.count,
          xp: agg.count * 50, // XP Calculation: 50 XP per event
        };
      })
      .filter((item) => item !== null) as LeaderboardEntry[];

    return leaderboard;
  } catch (error) {
    console.error("Server error in getLeaderboard:", error);
    return [];
  }
}
