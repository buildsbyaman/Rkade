"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Inter } from "next/font/google";
import Image from "next/image";
import EventGrid from "@/components/home/events";
import CampusEventComponent from "@/components/home/slugfiles";
import Navbar from "@/components/home/navbar";
import {
  getEventsByCampusClient,
  transformEventToFrontend,
} from "@/lib/events-client";
import { getCampusById } from "@/lib/campuses";
import { NavigationOverlayPill } from "@/components/NavigationOverlayPill";

const inter = Inter({ subsets: ["latin"] });

export default function CampusPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const resolvedParams = React.use(params);

  // State
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [campus, setCampus] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery] = useState(""); // Kept for compatibility if needed later
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Check for selected event in query params
  const selectedEventId = searchParams?.get("event");

  // Extract unique categories from events
  const categories = React.useMemo(() => {
    const cats = new Set(events.map((e) => e.category || "Event"));
    return ["All", ...Array.from(cats).sort()];
  }, [events]);

  // Filter events based on selected category
  const filteredEvents = React.useMemo(() => {
    if (selectedFilter === "All") return events;
    return events.filter((e) => e.category === selectedFilter);
  }, [events, selectedFilter]);

  // Fetch campus and events
  useEffect(() => {
    async function fetchData() {
      if (!resolvedParams?.id) return;

      const slug = resolvedParams.id;
      setLoading(true);

      try {
        // 1. Fetch Campus Details from local data
        const campusData = getCampusById(slug);
        console.log("🎓 Campus page - resolved ID:", slug);
        console.log("🎓 Campus page - campusData:", campusData);

        if (!campusData) {
          console.error("Campus not found:", slug);
          setLoading(false);
          return;
        }

        setCampus(campusData);

        // 2. Fetch Events for this campus from MongoDB via API
        console.log("🎓 Campus page - fetching events for campus:", slug);
        const eventsData = await getEventsByCampusClient(slug);
        console.log("🎓 Campus page - raw events from API:", eventsData);
        const formattedEvents = eventsData.map(transformEventToFrontend);
        console.log("🎓 Campus page - formatted events:", formattedEvents);
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching campus details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [resolvedParams?.id]);

  // Auth check
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  // Render Loading
  if (status === "loading" || loading) {
    return (
      <div className="min-h-dvh bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acid mx-auto"></div>
          <p className="mt-2 text-sm text-gray-400">
            Loading campus experience...
          </p>
        </div>
      </div>
    );
  }

  // Render Not Found
  if (!campus && !loading) {
    return (
      <div className="min-h-dvh bg-obsidian flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg">Campus not found.</p>
          <button
            onClick={() => router.push("/campuses")}
            className="mt-4 text-acid hover:underline"
          >
            Back to All Campuses
          </button>
        </div>
      </div>
    );
  }

  // Render Event Detail View (Overlay/Page)
  if (selectedEventId) {
    // If an event is selected via query param, we show the detail component.
    // Ideally, this should route to /events/[slug], but maintaining existing structure:
    const slug = `${resolvedParams.id}-${selectedEventId}`;
    // Note: The CampusEventComponent expects a slug that matches an event in DB.
    // Since we are moving to DB events, the slug logic in CampusEventComponent might need a look,
    // but for now we pass the constructed slug.
    // BETTER APPROACH: Just redirect to generic event page if it's a real event
    return <CampusEventComponent slug={slug} />;
  }

  // Render Main Campus Page
  return (
    <div className="min-h-dvh bg-obsidian text-white">
      <div className="mx-auto w-full max-w-[480px] md:max-w-7xl bg-obsidian min-h-screen relative">
        {/* Reusing existing Navbar structure/styles but ensuring it fits */}

        {/* Desktop Navbar is global, typically. If this page is effectively a standalone mobile-like view, we keep local Navbar */}

        <main className="pb-24 pt-0 md:pt-24 px-0 md:px-6">
          {/* Hero Section */}
          <section className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden md:rounded-3xl mb-8">
            <Image
              src={campus.image}
              alt={campus.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent flex flex-col justify-end p-6 md:p-12">
              <h1 className="text-4xl md:text-6xl font-display font-bold uppercase mb-2">
                {campus.name}
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl">
                {campus.fullName}
              </p>
              {campus.location && (
                <div className="flex items-center text-acid mt-4 gap-2">
                  <span className="material-symbols-outlined">location_on</span>
                  <span>{campus.location}</span>
                </div>
              )}
            </div>
          </section>

          {/* Filters with functionality */}
          <div className="flex gap-3 overflow-x-auto px-4 md:px-0 pb-6 scrollbar-hide">
            {categories.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedFilter === filter
                    ? "border-acid bg-acid/10 text-acid border"
                    : "border border-white/10 bg-white/5 text-white hover:border-acid hover:text-acid"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="px-4 md:px-0">
            <EventGrid
              events={filteredEvents.map((e) => ({
                ...e,
                href: `/events/${e.slug}`, // Direct link to event detail
              }))}
              title={`${selectedFilter === "All" ? "Upcoming" : selectedFilter} Events in ${campus.name}`}
              seeAllHref={`/events?campus=${campus.id}`}
              gridClass="grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
            />

            {filteredEvents.length === 0 && (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                <p className="text-gray-500">
                  No {selectedFilter === "All" ? "" : selectedFilter.toLowerCase()} events listed for this campus yet.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <NavigationOverlayPill />
    </div>
  );
}
