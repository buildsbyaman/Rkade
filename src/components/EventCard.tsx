"use client";

import { motion } from "framer-motion";
import { getCampusById } from "@/lib/campuses";
import Link from "next/link";

export interface EventCardProps {
  title: string;
  date?: string | Date | null;
  location?: string;
  category: string;
  image: string;
  price?: string;
  id?: string;
  slug: string;
  campus?: string;
  description?: string;
  index?: number;
  href?: string;
  hideStatusPill?: boolean;
}

export function EventCard({
  title,
  date,
  location,
  category,
  image,
  slug,
  campus,
  href,
  hideStatusPill,
}: EventCardProps) {
  // Parse date
  const dateObj = date ? new Date(date) : null;
  const month = dateObj ? dateObj.toLocaleString("default", { month: "short" }).toUpperCase() : "";
  const day = dateObj ? dateObj.getDate() : "";
  const dateLabel = dateObj ? `${month} ${day}` : "";

  // Calculate event status
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let eventStatus: "ongoing" | "upcoming" | "expired" = "upcoming";
  
  if (dateObj) {
    const eventDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    if (eventDate.getTime() === today.getTime()) {
      eventStatus = "ongoing";
    } else if (eventDate < today) {
      eventStatus = "expired";
    } else {
      eventStatus = "upcoming";
    }
  }

  const statusConfig = {
    ongoing: { label: "Live", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/20", dot: "bg-green-500 animate-pulse" },
    upcoming: { label: "Upcoming", bg: "bg-white/10", text: "text-white/80", border: "border-white/10", dot: "bg-acid" },
    expired: { label: "Ended", bg: "bg-black/30", text: "text-zinc-400", border: "border-white/5", dot: "bg-red-500/70" },
  };

  // Get campus display name
  const campusDisplay = campus && getCampusById(campus)
    ? getCampusById(campus)?.name
    : location;

  const borderColor = "group-hover:border-acid";
  const poster = image || "/Assests/1.jpg";

  return (
    <Link
      href={href || `/events/${slug}`}
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

          {/* Status pill: top-left (hidden for campus pages) */}
          {!hideStatusPill && (
            <div className={`absolute top-3 left-3 z-20 rounded-full backdrop-blur-xl ${statusConfig[eventStatus].bg} ${statusConfig[eventStatus].border} border px-2 py-1 flex items-center gap-1.5`}>
              <div className={`size-1.5 rounded-full ${statusConfig[eventStatus].dot}`} />
              <span className={`text-[9px] font-medium uppercase tracking-wider ${statusConfig[eventStatus].text}`}>
                {statusConfig[eventStatus].label}
              </span>
            </div>
          )}

          {/* Date badge: top-right, dark bg, white text (only if date exists) */}
          {dateObj && (
            <div className="absolute top-3 right-3 z-20 rounded-lg bg-obsidian/90 backdrop-blur-md border border-white/10 px-2.5 py-1.5 shadow-xl">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {dateLabel}
              </span>
            </div>
          )}

          {/* Category + Campus: bottom-left of image */}
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
}
