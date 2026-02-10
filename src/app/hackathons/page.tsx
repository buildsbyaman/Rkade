"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { NavigationOverlayPill } from "@/components/NavigationOverlayPill";

type EventRow = {
  id: string;
  slug: string;
  eventName: string;
  landscapePoster: string | null;
  portraitPoster: string | null;
  date: string | null;
  time: string | null;
  venue: string | null;
  category: string | null;
  language: string | null;
  price: string | null;
};

export default function HackathonsPage() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHackathons() {
      try {
        const response = await fetch("/api/events/category/Hackathons");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setEvents(data || []);
      } catch (err) {
        console.error("Failed to load hackathons", err);
      } finally {
        setLoading(false);
      }
    }
    loadHackathons();
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-white">
      <div className="relative bg-black/40 py-6 md:py-10">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="font-display text-5xl font-bold tracking-wide text-white md:text-7xl mb-2 md:mb-4">
            Campus <span className="text-acid">Hackathons</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-0 md:pt-12">
        {loading ? (
          <div className="text-center py-20 animate-pulse text-gray-500">
            Loading hackathons...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <h3 className="text-xl font-bold uppercase text-white mb-2">
              No Hackathons Found
            </h3>
            <p className="text-gray-400">
              Check back later for upcoming challenges.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev, index) => (
              <EventCard
                key={ev.id}
                title={ev.eventName}
                slug={ev.slug}
                image={ev.landscapePoster || ev.portraitPoster || "/Assests/1.jpg"}
                date={ev.date}
                category={ev.category || "Hackathon"}
                location={ev.venue || undefined}
                campus={undefined}
                price={ev.price || undefined}
                description={undefined}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
      <NavigationOverlayPill />
    </div>
  );
}
