"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Inter } from "next/font/google"
import Image from "next/image";
import { getCampusById } from "@/lib/campuses";
import Navbar from "./navbar"

const inter = Inter({ subsets: ["latin"] })

export type Event = { id: string; category: string; name: string; img: string; slug: string }

type Props = {
  events?: Event[]
  title?: string
  initialSearch?: string
  requireAuth?: boolean
  maxWidth?: string
  onCampusClick?: (slug: string) => void
  includeLocalEvents?: boolean
}

export default function AllCampuses({
  events: propEvents,
  title = "All Campuses",
  initialSearch = "",
  requireAuth = true,
  maxWidth = "max-w-[420px]",
  onCampusClick,
  includeLocalEvents = true,
}: Props) {
  // Hooks (always called in the same order)
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery] = useState(initialSearch)

  // Default dataset when none provided
  const defaultEvents: Event[] = [
    { id: "e1", category: "New Delhi", name: "IIT-D", img: "/brand1.svg", slug: "iit-delhi" },
    { id: "e2", category: "New Delhi", name: "DU", img: "/brand2.svg", slug: "delhi-university" },
    { id: "e3", category: "New Delhi", name: "DTU", img: "/brand3.svg", slug: "dtu-delhi" },
    { id: "e4", category: "New Delhi", name: "Maharaja Agarsen", img: "/brand3.svg", slug: "maharaja-agarsen" },
    { id: "e5", category: "New Delhi", name: "AIIMS", img: "/brand1.svg", slug: "aiims-delhi" },
    { id: "e6", category: "New Delhi", name: "NIT-D", img: "/brand2.svg", slug: "nit-delhi" },
  ]

  const events = propEvents && propEvents.length > 0 ? propEvents : defaultEvents

  // Merge in locally created events (persisted in localStorage) and listen for updates
  const [mergedEvents, setMergedEvents] = useState<Event[]>(() => {
    if (!includeLocalEvents) {
      return events;
    }
    
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('localEvents') : null;
      const local = stored ? (JSON.parse(stored) as Array<{id: string; name?: string; slug?: string; campus_slug?: string; category?: string; img?: string}>) : [];

      // derive a simple page key from the title (e.g. "All Movies" -> "movies")
      const pageKey = title ? title.toLowerCase().replace(/^all\s+/, '').trim() : '';

      const filteredLocal = pageKey && events && events.length > 0
        ? local.filter((le) => {
            const campusSlug = (le?.campus_slug || le?.slug || '').toString().toLowerCase();
            const localCat = (le?.category || '').toString().toLowerCase();
            // include if local event explicitly targeted this page by campus_slug
            if (campusSlug && campusSlug === pageKey) return true;
            // include if local event slug matches any of the page event slugs
            if (campusSlug && events.some((pe) => pe.slug && pe.slug.toString().toLowerCase() === campusSlug)) return true;
            // include if local event category matches page key or any page event category
            if (localCat && (localCat === pageKey || events.some((pe) => pe.category && pe.category.toString().toLowerCase() === localCat))) return true;
            return false;
          }).map((le): Event => ({
            id: le.id,
            name: le.name || 'Event',
            category: le.category || 'General',
            img: le.img || '/placeholder.svg',
            slug: le.slug || le.id
          }))
        : local.map((le): Event => ({
            id: le.id,
            name: le.name || 'Event',
            category: le.category || 'General',
            img: le.img || '/placeholder.svg',
            slug: le.slug || le.id
          }));

      return filteredLocal.concat(events);
    } catch {
      return events;
    }
  });

  useEffect(() => {
    if (!includeLocalEvents) return;
    
    const onUpdate = (ev: Event | CustomEvent) => {
      try {
        const stored = localStorage.getItem('localEvents');
        const local = stored ? (JSON.parse(stored) as Array<{id: string; name?: string; slug?: string; campus_slug?: string; category?: string; img?: string}>) : [];

        const pageKey = title ? title.toLowerCase().replace(/^all\s+/, '').trim() : '';

        const filteredLocal = pageKey && events && events.length > 0
          ? local.filter((le) => {
              const campusSlug = (le?.campus_slug || le?.slug || '').toString().toLowerCase();
              const localCat = (le?.category || '').toString().toLowerCase();
              if (campusSlug && campusSlug === pageKey) return true;
              if (campusSlug && events.some((pe) => pe.slug && pe.slug.toString().toLowerCase() === campusSlug)) return true;
              if (localCat && (localCat === pageKey || events.some((pe) => pe.category && pe.category.toString().toLowerCase() === localCat))) return true;
              return false;
            }).map((le): Event => ({
              id: le.id,
              name: le.name || 'Event',
              category: le.category || 'General',
              img: le.img || '/placeholder.svg',
              slug: le.slug || le.id
            }))
          : local.map((le): Event => ({
              id: le.id,
              name: le.name || 'Event',
              category: le.category || 'General',
              img: le.img || '/placeholder.svg',
              slug: le.slug || le.id
            }));

        setMergedEvents(filteredLocal.concat(events));
      } catch {
        setMergedEvents(events);
      }
    };
    const listener = () => onUpdate({} as CustomEvent);
  window.addEventListener('events:updated', listener as unknown as EventListener);
  return () => window.removeEventListener('events:updated', listener as unknown as EventListener);
  }, [events, includeLocalEvents, title]);

  // Redirect to sign in if required and not authenticated
  useEffect(() => {
    if (!requireAuth) return
    if (status === "loading") return
    if (!session) router.push("/auth/signin")
  }, [requireAuth, session, status, router])

  // Handle campus card click
  const handleCampusClick = (slug: string) => {
    if (onCampusClick) return onCampusClick(slug)
    // If slug corresponds to a known campus (including artists/categories), go to campus page
    const campus = getCampusById(slug);
    if (campus) {
      router.push(`/campuses/${slug}`);
      return;
    }
  // Otherwise assume this is a standalone event and route to its event page
  // Use the new canonical events route
  router.push(`/events/${slug}`);
  }

  // Show loading while checking authentication if required
  if (requireAuth && status === "loading") {
    return (
      <div className={`min-h-dvh bg-white flex items-center justify-center ${inter.className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-2 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If auth required and not logged in, don't render (redirect handled in effect)
  if (requireAuth && !session) return null

  return (
    <div className={`min-h-dvh bg-gray-50 ${inter.className}`}>
      {/* Phone-width container */}
      <div className={`mx-auto w-full ${maxWidth} bg-white`}>
        <Navbar/>

        <main className="px-4 pb-8 pt-0 md:pt-36">
          {/* All Campus Events */}
          <section aria-labelledby="all-events" className="mb-6">
            <div className="mb-3 flex items-center gap-3">
              <h2 id="all-events" className="text-base font-medium">
                {title}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {mergedEvents
                .filter((event) =>
                  searchQuery.trim() === "" ||
                  event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  event.category.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((event) => (
                  <article
                    key={event.id}
                    onClick={() => handleCampusClick(event.slug)}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white cursor-pointer hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="h-48 w-full bg-zinc-100">
                      <Image
                        src={event.img || "/placeholder.svg"}
                        alt={event.name}
                        width={400}
                        height={192}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-zinc-500">{event.category}</p>
                      <h3 className="mt-1 line-clamp-2 text-base font-medium">{event.name}</h3>
                      <p className="mt-2 text-sm text-blue-600">View Campus →</p>
                    </div>
                  </article>
                  
                ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

/* Icons */
function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-zinc-600">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}
