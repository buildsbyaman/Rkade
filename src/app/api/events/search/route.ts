import { NextRequest, NextResponse } from "next/server";
import { getDb, transformMongoDocuments } from "@/lib/mongodb-server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const eventTypeSlug = searchParams.get("eventType") || "";
    const categorySlug = searchParams.get("category") || "";
    const languageSlug = searchParams.get("language") || "";
    const age = searchParams.get("age") || "";
    const dateOnly = searchParams.get("dateOnly") || "";
    const sort = searchParams.get("sort") || "soonest";

    const db = await getDb();

    // Build filter with AND conditions
    const andConditions: any[] = [];

    // Search across multiple fields
    if (search.trim()) {
      andConditions.push({
        $or: [
          { eventName: { $regex: search.trim(), $options: "i" } },
          { event_name: { $regex: search.trim(), $options: "i" } },
          { description: { $regex: search.trim(), $options: "i" } },
          { venue: { $regex: search.trim(), $options: "i" } },
        ],
      });
    }

    // Event Type - match by slug or name
    if (eventTypeSlug) {
      const eventTypeDoc = await db
        .collection("eventTypes")
        .findOne({ slug: eventTypeSlug });

      if (eventTypeDoc) {
        andConditions.push({
          $or: [
            { eventType: eventTypeDoc.slug },
            { eventType: eventTypeDoc.name },
            { eventType: { $regex: `^${eventTypeDoc.name}$`, $options: "i" } },
          ],
        });
      }
    }

    // Category - match by slug or name
    if (categorySlug) {
      const categoryDoc = await db
        .collection("categories")
        .findOne({ slug: categorySlug });

      if (categoryDoc) {
        andConditions.push({
          $or: [
            { category: categoryDoc.slug },
            { category: categoryDoc.name },
            { category: { $regex: `^${categoryDoc.name}$`, $options: "i" } },
          ],
        });
      }
    }

    // Language - match by slug or name
    if (languageSlug) {
      const languageDoc = await db
        .collection("languages")
        .findOne({ slug: languageSlug });

      if (languageDoc) {
        andConditions.push({
          $or: [
            { language: languageDoc.slug },
            { language: languageDoc.name },
            { language: { $regex: `^${languageDoc.name}$`, $options: "i" } },
          ],
        });
      }
    }

    // Age limit
    if (age) {
      andConditions.push({
        $or: [
          { ageLimit: age },
          { age_limit: age },
          { ageLimit: { $regex: `^${age}`, $options: "i" } },
          { age_limit: { $regex: `^${age}`, $options: "i" } },
        ],
      });
    }

    // Date filter
    if (dateOnly) {
      andConditions.push({
        $or: [
          { date: dateOnly },
          { dateFrom: { $lte: dateOnly }, dateTo: { $gte: dateOnly } },
        ],
      });
    }

    // Build final filter
    const filter = andConditions.length > 0 ? { $and: andConditions } : {};

    // Build sort
    let sortOption: any = { date: 1 }; // default: soonest

    switch (sort) {
      case "latest":
        sortOption = { date: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "price_low_high":
        sortOption = { price: 1 };
        break;
      case "price_high_low":
        sortOption = { price: -1 };
        break;
      case "soonest":
      default:
        sortOption = { date: 1 };
        break;
    }

    // ...existing code...
    // ...existing code...

    const events = await db
      .collection("events")
      .find(filter)
      .sort(sortOption)
      .limit(1000)
      .toArray();

    // ...existing code...

    return NextResponse.json(transformMongoDocuments(events));
  } catch (error) {
    // ...existing code...
    return NextResponse.json(
      {
        error: "Failed to fetch events",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
