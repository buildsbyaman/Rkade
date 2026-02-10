"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getFeaturedEventsClient } from "@/lib/events-client";
import { getCampusById } from "@/lib/campuses";
import Link from "next/link";

export function LandingTrending() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function fetchTrending() {
      try {
        const data = await getFeaturedEventsClient(20);
        setEvents(data);
      } catch (error) {
        console.error("Failed to load trending events", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  if (loading)
    return (
      <div className="py-20 text-center text-zinc-500">
        Loading trending events...
      </div>
    );
  if (events.length === 0) return null;

  const displayEvents = isMobile ? events.slice(0, 20) : events.slice(0, 8);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-0 pb-32 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white uppercase">
            Trending Now
          </h2>
        </div>
        <Link
          href="/events"
          className="hidden sm:flex items-center gap-2 text-acid hover:text-white transition-colors font-bold uppercase tracking-widest text-sm group"
        >
          View all{" "}
          <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayEvents.map((event) => {
          const dateObj = event.date ? new Date(event.date) : new Date();
          const month = dateObj.toLocaleString("default", { month: "short" }).toUpperCase();
          const day = dateObj.getDate();
          const dateLabel = `${month} ${day}`;

          const campusSlug = event.campusSlug || event.campus_slug;
          const venue = event.venue;
          const campusDisplay =
            campusSlug && getCampusById(campusSlug)
              ? getCampusById(campusSlug)?.name
              : venue;

          const borderColor = "group-hover:border-acid";

          const poster =
            event.landscapePoster ||
            event.landscape_poster ||
            event.portraitPoster ||
            event.portrait_poster ||
            "/Assests/1.jpg";

          const title = event.eventName || event.event_name;
          const category = event.category || "Event";

          return (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              passHref
              className="block h-full"
            >
              <motion.div
                whileHover={{ y: -5 }}
                className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-glass-border bg-glass backdrop-blur-sm transition-all ${borderColor} cursor-pointer`}
              >
                {/* Image area with overlays */}
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent z-10" />
                  <div className="h-full w-full bg-slate-800 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={poster}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Date badge: top-right, dark bg, white text (e.g. "MAY 10") */}
                  <div className="absolute top-3 right-3 z-20 rounded-lg bg-obsidian/90 backdrop-blur-md border border-white/10 px-2.5 py-1.5 shadow-xl">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {dateLabel}
                    </span>
                  </div>

                  {/* Category + Campus: bottom-left of image (50% size) */}
                  <div className="absolute bottom-2 left-2 z-20 flex flex-wrap items-center gap-1 max-w-[85%]">
                    <span className="rounded px-1.5 py-0.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-acid text-black">
                      {category}
                    </span>
                    {campusDisplay && (
                      <span className="rounded px-1.5 py-0.5 text-[8px] sm:text-[10px] font-medium uppercase tracking-wider bg-obsidian/80 text-white border border-white/20 backdrop-blur-sm">
                        {campusDisplay}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title only below image - most prominent */}
                <div className="flex flex-1 flex-col justify-end p-3 sm:p-4">
                  <h3 className="text-base sm:text-xl font-bold text-white uppercase leading-tight line-clamp-2 group-hover:text-acid transition-colors">
                    {title}
                  </h3>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={() => (window.location.href = "/events")}
          className="px-8 py-4 rounded-xl bg-gradient-to-r from-acid to-white text-black font-bold uppercase tracking-widest shadow-lg hover:shadow-neon-acid active:scale-[0.98] transition-all"
        >
          Explore All Events
        </button>
      </div>
    </section>
  );
}
