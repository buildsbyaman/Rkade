import { getDb, transformMongoDocuments } from "@/lib/mongodb-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const db = await getDb();
    const fest = await db.collection("subtypes").findOne({
      slug: slug,
      eventTypeSlug: "fest",
    });

    if (!fest) {
      return NextResponse.json({ error: "Fest not found" }, { status: 404 });
    }

    const transformed = transformMongoDocuments([fest])[0] as {
      id: string;
      slug: string;
      name: string;
      description?: string;
      landscape_url?: string;
      portrait_url?: string;
      location: string;
    };

    return NextResponse.json({
      id: transformed.id,
      slug: transformed.slug,
      name: transformed.name,
      fullName: transformed.description || transformed.name,
      image: transformed.landscape_url || transformed.portrait_url || "/placeholder.svg",
      location: transformed.location,
    });
  } catch (error) {
    console.error("Error fetching fest:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
