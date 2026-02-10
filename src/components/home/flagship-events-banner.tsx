"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getFeaturedEventsClient, type FeaturedEvent } from "@/lib/events-client";

export default function FlagshipEventsBanner() {
  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const featuredEvents = await getFeaturedEventsClient(6); // Get 6 flagship events
        setEvents(featuredEvents);
      } catch (error) {
        console.error("Error fetching flagship events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getPosterImage = (event: FeaturedEvent): string => {
    return event.landscape_poster || event.portrait_poster || "/placeholder.svg";
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-[324px] glass-card rounded-3xl flex items-center justify-center border border-white/10 shadow-matte">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acid"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex-1 h-[324px] glass-card rounded-3xl flex items-center justify-center border border-white/10 shadow-matte">
        <p className="text-gray-400 text-lg">No flagship events available</p>
      </div>
    );
  }

  // Duplicate events for seamless infinite scroll
  const duplicatedEvents = [...events, ...events, ...events];

  return (
    <div className="flex-1 h-[324px] glass-card rounded-3xl overflow-hidden relative border border-white/10 shadow-matte">
      <style jsx>{`
        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .scroll-container {
          animation: scroll-left 30s linear infinite;
        }

        .scroll-container:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
        <h3 className="text-white text-2xl font-bold uppercase tracking-widest">
          FLAGSHIP EVENTS
        </h3>
        <p className="text-gray-300 text-sm">Discover our featured events</p>
      </div>

      {/* Scrolling Container */}
      <div className="scroll-container flex gap-4 h-full items-center px-4">
        {duplicatedEvents.map((event, index) => (
          <Link
            key={`${event.id}-${index}`}
            href={`/events/${event.slug || event.id}`}
            className="flex-shrink-0 w-[280px] h-[320px] rounded-lg overflow-hidden group cursor-pointer transform transition-transform hover:scale-105"
          >
            <div className="relative w-full h-full">
              {/* Event Image */}
              <Image
                src={getPosterImage(event)}
                alt={event.event_name}
                fill
                className="object-cover"
                sizes="280px"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

              {/* Event Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                {event.category && (
                  <span className="inline-block bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded mb-2">
                    {event.category}
                  </span>
                )}
                <h4 className="text-white text-lg font-bold line-clamp-2 mb-1">
                  {event.event_name}
                </h4>
                {event.date && (
                  <div className="flex items-center gap-1 text-gray-300 text-sm">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span className="text-xs">{String(event.date)}</span>
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center gap-1 text-gray-300 text-sm mt-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-xs line-clamp-1">{event.venue}</span>
                  </div>
                )}
              </div>

              {/* Hover Effect - Arrow */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-yellow-400 rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Fade edges for seamless effect */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none z-10"></div>
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none z-10"></div>
    </div>
  );
}
