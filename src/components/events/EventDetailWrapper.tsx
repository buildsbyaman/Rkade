"use client";

import React, { useEffect, useState } from "react";
import CampusEventComponent from "@/components/home/slugfiles";
import { getCampusById } from "@/lib/campuses";
import { SessionProvider } from "next-auth/react";

type FrontEvent = {
  id: string;
  category: string;
  name: string;
  price?: string;
  img?: string;
  slug?: string;
  date?: string;
  time?: string;
  venue?: string;
  description?: string;
  language?: string;
  ageLimit?: string;
  duration?: string;
  performers?: string;
  isTeamEvent?: boolean;
};

type ServerEvent = {
  id?: string;
  slug?: string;
  event_type?: string;
  category?: string;
  event_name?: string;
  eventName?: string;
  name?: string;
  price?: string;
  landscape_poster?: string;
  landscapePoster?: string;
  portrait_poster?: string;
  portraitPoster?: string;
  campus_slug?: string;
  campus?: string;
  venue?: string;
  description?: string;
  date?: string;
  time?: string;
  duration?: string;
  age_limit?: string;
  ageLimit?: string;
  language?: string;
  performers?: string;
  is_team_event?: boolean;
  isTeamEvent?: boolean;
  min_team_size?: number;
  max_team_size?: number;
  registration_start?: string;
  registration_end?: string;
  result_date?: string;
  timeline?: Array<{
    title: string;
    date: string;
    time?: string;
    description?: string;
    status?: "completed" | "active" | "upcoming";
  }>;
};

function EventDetailWrapper({
  slug,
  serverEvent,
}: {
  slug: string;
  serverEvent?: ServerEvent;
}): React.ReactElement | null {
  const [localEvent, setLocalEvent] = useState<FrontEvent | null>(null);

  useEffect(() => {
    if (serverEvent) return; // prefer server data
    try {
      const stored = localStorage.getItem("localEvents");
      if (!stored) return;
      const list = JSON.parse(stored) as FrontEvent[];
      // attempt to find an event matching the provided slug
      const found = list.find((e) => e.slug === slug || e.id === slug);
      if (found) setLocalEvent(found);
    } catch {
      // ignore
    }
  }, [serverEvent, slug]);

  if (serverEvent) {
    // Debug: Log the server event data
    console.log("EventDetailWrapper - serverEvent:", serverEvent);

    // serverEvent shape from DB — convert to the small Event shape expected by slugfiles
    const ev = {
      id: serverEvent.id?.toString() || serverEvent.slug || slug,
      // prefer a specific event_type or category for UI grouping, but don't treat this as the campus id
      category: serverEvent.event_type || serverEvent.category || "Event",
      name:
        serverEvent.event_name ||
        serverEvent.eventName ||
        serverEvent.name ||
        serverEvent.slug ||
        "Event",
      price: serverEvent.price || "",
      img:
        serverEvent.landscape_poster ||
        serverEvent.landscapePoster ||
        serverEvent.portrait_poster ||
        serverEvent.portraitPoster ||
        "/placeholder.svg",
      slug: serverEvent.slug || slug,
      date: serverEvent.date || undefined,
      time: serverEvent.time,
      venue: serverEvent.venue,
      description: serverEvent.description,
      language: serverEvent.language,
      ageLimit: serverEvent.age_limit || serverEvent.ageLimit,
      duration: serverEvent.duration,
      performers: serverEvent.performers,
      isTeamEvent: serverEvent.is_team_event || serverEvent.isTeamEvent,
    };

    // Determine campus separately. Prefer an explicit campus_slug (recommended DB column).
    // If not provided, try to resolve the category as a campus only when it matches a known campus.
    const explicitCampusSlug =
      serverEvent.campus_slug || serverEvent.campus || null;
    let resolvedCampus = null;
    if (explicitCampusSlug) resolvedCampus = getCampusById(explicitCampusSlug);
    // fallback: only treat category as a campus when it actually maps to a known campus entry
    if (!resolvedCampus && serverEvent.category) {
      const maybe = getCampusById(serverEvent.category);
      if (maybe) resolvedCampus = maybe;
    }

    const campus = resolvedCampus || {
      id: "events",
      name: ev.category || "Events",
      fullName: ev.category || "Events",
      image: serverEvent.landscape_poster || "/brand1.svg",
      location: serverEvent.venue || "Unknown",
    };

    return (
      <SessionProvider>
        <CampusEventComponent
          campus={campus}
          event={ev}
          serverEvent={serverEvent}
        />
      </SessionProvider>
    );
  }

  if (localEvent) {
    const campus = {
      id: "local",
      name: "Local",
      fullName: "Local Events",
      image: localEvent.img || "/brand1.svg",
      location: "Unknown",
    };
    const event = {
      id: localEvent.id,
      category: localEvent.category,
      name: localEvent.name,
      img: localEvent.img || "/placeholder.svg",
      price: localEvent.price || "",
      slug: localEvent.slug || localEvent.id,
    };
    return (
      <SessionProvider>
        <CampusEventComponent campus={campus} event={event} />
      </SessionProvider>
    );
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-obsidian text-white">
      {" "}
      <p className="text-gray-400 font-mono uppercase tracking-widest">
        Event not found
      </p>{" "}
    </div>
  );
}

export default EventDetailWrapper;
