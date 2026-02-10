import Link from "next/link";
import { getDb, transformMongoDocuments } from "@/lib/mongodb-server";
import { EventCard } from "@/components/EventCard";
import { NavigationOverlayPill } from "@/components/NavigationOverlayPill";
import { MapPin } from "lucide-react";

export const revalidate = 0; // Disable caching for debugging
export const dynamic = "force-dynamic"; // Force dynamic rendering

interface Campus {
  id: string;
  slug: string;
  name: string;
  portrait_url?: string;
  landscape_url?: string;
  location?: string;
}

async function getCampuses(): Promise<Campus[]> {
  try {
    const db = await getDb();
    const allSubtypesCount = await db.collection("subtypes").countDocuments();
    console.log("DEBUG: Total subtypes in DB:", allSubtypesCount);

    const campuses = await db
      .collection("subtypes")
      .find({
        eventTypeSlug: "campus",
        isActive: true,
      })
      .sort({ position: 1 })
      .toArray();

    const transformed = transformMongoDocuments(campuses) as Campus[];
    console.log("Fetched campuses:", transformed.length);
    console.log("Campus data:", JSON.stringify(transformed, null, 2));
    return transformed;
  } catch (error) {
    console.error("Error fetching campuses:", error);
    return [];
  }
}

export default async function CampusesPage() {
  const campuses = await getCampuses();
  console.log(campuses)

  return (
    <div className="min-h-screen bg-obsidian text-white">
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-electric-indigo/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-acid/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative bg-black/40 py-6 md:py-10">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="font-display text-5xl font-bold tracking-wide text-white md:text-7xl mb-2 md:mb-4">
            Explore <span className="text-acid">Campuses</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-0 md:pt-12">
          {campuses.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 mb-6">
                <MapPin className="h-8 w-8 text-zinc-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                No Campuses Found
              </h3>
              <p className="text-zinc-500">
                Check back later as we expand to more universities.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {campuses.map((campus, index) => (
                <EventCard
                  key={campus.id}
                  title={campus.name}
                  slug={campus.slug}
                  href={`/campuses/${campus.slug}`}
                  image={campus.portrait_url || "/Assests/1.jpg"}
                  date={undefined}
                  category={"Campus"}
                  location={undefined}
                  campus={undefined}
                  price={undefined}
                  description={undefined}
                  index={index}
                  hideStatusPill={true}
                />
              ))}
            </div>
          )}
        </div>

      <NavigationOverlayPill />
    </div>
  );
}
