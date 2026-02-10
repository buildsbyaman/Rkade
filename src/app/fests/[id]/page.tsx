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
  getEventsByFestClient,
  transformEventToFrontend,
} from "@/lib/events-client";
import { NavigationOverlayPill } from "@/components/NavigationOverlayPill";
import { AutoScrollCarousel } from "@/components/AutoScrollCarousel";
import { Calendar, MapPin, Ticket, Users } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function FestPage({
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
  const [fest, setFest] = useState<any | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const selectedEventId = searchParams?.get("event");

  // Show all events (no category filtering)
  const filteredEvents = events;

  // Fetch fest and events
  useEffect(() => {
    async function fetchData() {
      if (!resolvedParams?.id) return;

      const slug = resolvedParams.id;
      setLoading(true);

      try {
        // 1. Fetch Fest Details from API
        console.log("🎉 Fest page - fetching fest details for:", slug);
        const festResponse = await fetch(`/api/fests/${slug}`);
        if (!festResponse.ok) {
          console.error("Fest not found:", festResponse.status);
          setLoading(false);
          return;
        }

        const festData = await festResponse.json();
        console.log("🎉 Fest page - fest data:", festData);
        setFest(festData);

        // 2. Fetch Events for this fest from MongoDB via API
        console.log("🎉 Fest page - fetching events for fest:", slug);
        const eventsData = await getEventsByFestClient(slug);
        console.log("🎉 Fest page - raw events from API:", eventsData);
        const formattedEvents = eventsData.map(transformEventToFrontend);
        console.log("🎉 Fest page - formatted events:", formattedEvents);
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Error fetching fest details:", error);
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

  if (status === "loading" || loading) {
    return (
      <div className="min-h-dvh bg-obsidian flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-acid mx-auto"></div>
          <p className="mt-2 text-sm text-gray-400">
            Loading fest experience...
          </p>
        </div>
      </div>
    );
  }

  if (!fest && !loading) {
    return (
      <div className="min-h-dvh bg-obsidian flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-lg">Fest not found.</p>
          <button
            onClick={() => router.push("/fests")}
            className="mt-4 text-acid hover:underline"
          >
            Back to All Fests
          </button>
        </div>
      </div>
    );
  }

  if (selectedEventId) {
    const slug = `${resolvedParams.id}-${selectedEventId}`;
    return <CampusEventComponent slug={slug} />;
  }

  // Calculate fest dates based on events
  const festStartDate = events.length > 0 
    ? new Date(Math.min(...events.map(e => new Date(e.date || Date.now()).getTime())))
    : null;
  const festEndDate = events.length > 0 
    ? new Date(Math.max(...events.map(e => new Date(e.date || Date.now()).getTime())))
    : null;

  const formatDateRange = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "Dates TBA";
    const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const endStr = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (startStr === endStr) return startStr;
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="min-h-dvh bg-obsidian text-white">
      <div className="mx-auto w-full max-w-[480px] md:max-w-7xl bg-obsidian min-h-screen relative">
        {/* Desktop Navbar is global, typically. If this page is effectively a standalone mobile-like view, we keep local Navbar */}

        <main className="pb-24 pt-0 md:pt-24 px-0 md:px-6">
          {/* Hero Section */}
          <section className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden md:rounded-3xl mb-8">
            <Image
              src={fest.image}
              alt={fest.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent flex flex-col justify-end p-6 md:p-12">
              <h1 className="text-4xl md:text-6xl font-display font-bold uppercase mb-2">
                {fest.name}
              </h1>
              <p className="text-gray-300 text-lg md:text-xl max-w-2xl">
                {fest.fullName}
              </p>
            </div>
          </section>

          {/* Fest Details Section */}
          <div className="px-4 md:px-0 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Date Range */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-acid" />
                  <span className="text-sm text-gray-400">Dates</span>
                </div>
                <p className="text-white font-semibold">
                  {formatDateRange(festStartDate, festEndDate)}
                </p>
              </div>

              {/* Location */}
              {fest.location && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-acid" />
                    <span className="text-sm text-gray-400">Location</span>
                  </div>
                  <p className="text-white font-semibold">{fest.location}</p>
                </div>
              )}

              {/* Number of Events */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="h-5 w-5 text-acid" />
                  <span className="text-sm text-gray-400">Events</span>
                </div>
                <p className="text-white font-semibold">
                  {events.length} {events.length === 1 ? "Event" : "Events"}
                </p>
              </div>

              {/* Categories */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-acid" />
                  <span className="text-sm text-gray-400">Categories</span>
                </div>
                <p className="text-white font-semibold">
                  {new Set(events.map((e) => e.category || "Event")).size} Types
                </p>
              </div>
            </div>
          </div>

          {/* Auto-scroll Image Gallery */}
          <div className="mb-8">
            <AutoScrollCarousel
              title="Featured Speakers"
              speakers={[
                {
                  image: "/Assests/S1.jpg",
                  name: "Mr. Nivedan Rathi",
                  title: "Founder",
                  company: "Future & AI"
                },
                {
                  image: "/Assests/S2.png",
                  name: "Mr. Ganeshprasad S",
                  title: "Co-Founder & COO",
                  company: "Think School"
                },
                {
                  image: "/Assests/S3.png",
                  name: "Mr. Anurag Roy",
                  title: "Founder & CTO",
                  company: "Alchemist AI"
                },
                {
                  image: "/Assests/S4.png",
                  name: "Mr. Deepak Rangarao",
                  title: "WW CTO/Technical Sales Leader - Data & AI",
                  company: "IBM (San Francisco Bay Area)"
                },
                {
                  image: "/Assests/S5.png",
                  name: "Mr. Teja Chintalapati",
                  title: "Principle Manager - Cyber Innovation",
                  company: "Data Security Council of India"
                },
                {
                  image: "/Assests/S6.jpg",
                  name: "Mr. Mohit Bhasin",
                  title: "Global Head of Economic Growth",
                  company: "Head of AI City Project, UP, KPMG"
                },
                {
                  image: "/Assests/S7.jpg",
                  name: "Mr. Himanshu Joshi",
                  title: "Program Director",
                  company: "Niti Aayog"
                }
              ]}
            />
          </div>

          {/* Events Grid */}
          <div className="px-4 md:px-0">
            <EventGrid
              events={filteredEvents.map((e) => ({
                ...e,
                href: `/events/${e.slug}`, // Direct link to event detail
              }))}
              title={`Lineup Events in ${fest.name}`}
              seeAllHref={`/events?fest=${fest.id}`}
              gridClass="grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
            />

            {filteredEvents.length === 0 && (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
                <p className="text-gray-500">
                  No events listed for this fest yet.
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
