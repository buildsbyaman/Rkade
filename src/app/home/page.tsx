"use client";

import React from "react";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import Image from "next/image";
import EventGrid from "../../components/home/events";
import Categories from "../../components/home/categories";
import Navbar from "../../components/home/navbar";
import DesktopNavbar from "../../components/home/desktop-navbar";
import DesktopMainLayout from "../../components/home/desktop-main-layout";
import { useDesktop } from "../../hooks/useDesktop";
import { getEventsClient, transformEventToFrontend } from "@/lib/events-client";
const inter = Inter({ subsets: ["latin"] });

type Banner = {
  id: string;
  title: string;
  img: string;
  alt: string;
  description?: string;
};
type EventCategory = { id: string; title: string; img: string };
type Event = {
  id: string;
  category: string;
  name: string;
  price: string;
  img: string;
  href?: string;
  date?: string;
  language: string;
  ageLimit: string;
  eventType: string;
  venue?: string;
  campusSlug?: string;
  description?: string;
  slug?: string;
};

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isDesktop = useDesktop();

  // Events state for mobile
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Carousel state - ALL HOOKS MUST BE CALLED BEFORE ANY RETURNS
  const [index, setIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const banners: Banner[] = [
    {
      id: "b1",
      title: "Discover Amazing Events",
      img: "/Banner.svg",
      alt: "Event banner",
      description:
        "Find the best events, movies, and sports activities near you",
    },
    {
      id: "b2",
      title: "New Experiences Await",
      img: "/Banner.svg",
      alt: "Fresh events banner",
      description: "Join exciting events and create memorable moments",
    },
  ];

  // Fetch events from Supabase for mobile
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setEventsLoading(true);
        const allEvents = await getEventsClient();
        const transformedEvents = allEvents.map(transformEventToFrontend);
        setEvents(transformedEvents);
      } catch (error) {
        console.error("Error fetching events for mobile:", error);
        setEvents([]); // Set empty array on error
      } finally {
        setEventsLoading(false);
      }
    };

    // Only fetch events for mobile view
    if (!isDesktop) {
      fetchEvents();
    }
  }, [isDesktop]);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/auth/signin");
      return;
    }
  }, [session, status, router]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  // Animate translateX when index changes
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    el.style.transition = "transform 400ms ease";
    el.style.transform = `translateX(-${index * 100}%)`;
  }, [index]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div
        className={`min-h-dvh bg-white flex items-center justify-center ${inter.className}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-2 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the page if not authenticated
  if (!session) {
    return null;
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    const el = sliderRef.current;
    if (el) el.style.transition = "none";
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const currentX = e.touches[0].clientX;
    touchDeltaX.current = currentX - touchStartX.current;
    const el = sliderRef.current;
    if (!el) return;
    const width = el.clientWidth / banners.length;
    const base = -index * width;
    el.style.transform = `translateX(${base + touchDeltaX.current}px)`;
  }
  function onTouchEnd() {
    const threshold = 40; // px to decide swipe
    if (touchDeltaX.current > threshold) {
      setIndex((prev) => (prev - 1 + banners.length) % banners.length);
    } else if (touchDeltaX.current < -threshold) {
      setIndex((prev) => (prev + 1) % banners.length);
    } else {
      // snap back
      const el = sliderRef.current;
      if (el) {
        el.style.transition = "transform 300ms ease";
        el.style.transform = `translateX(-${index * 100}%)`;
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  const eventCategories: EventCategory[] = [
    { id: "c1", title: "Campus", img: "/pears.svg" },
    { id: "c2", title: "Events", img: "/watermelon.svg" },
    { id: "c3", title: "Movies", img: "/lemon.svg" },
    { id: "c4", title: "Sports", img: "/wood.svg" },
  ];

  // Prepare categories and events with hrefs
  const routeMap: Record<string, string> = {
    Campus: "/campuses",
    Events: "/events",
    Movies: "/movie",
    Home: "/home",
    Sports: "/sports",
  };

  const categoriesWithHref = eventCategories.map((c) => ({
    id: c.id,
    title: c.title,
    img: c.img,
    href: routeMap[c.title] ?? "/Eventspage",
  }));

  const eventsWithHref = events.map((e) => ({
    ...e,
    href: e.href || `/events/${e.slug || e.id}`,
  }));

  // Desktop Layout
  if (isDesktop) {
    return (
      <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
        <DesktopNavbar logoText="rkade" />
        <DesktopMainLayout events={eventsWithHref} showArtistNearYou={false} />
      </div>
    );
  }

  // Mobile Layout (existing)
  return (
    <div className={`min-h-dvh bg-gray-50 ${inter.className}`}>
      {/* Responsive container */}
      <div className="mx-auto w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl bg-white">
        <Navbar />

        <main className="px-4 sm:px-6 md:px-8 pb-[96px] md:pb-24 md:pt-36">
          {/* Banner carousel */}
          <section aria-label="Promotions" className="mb-8 md:mb-12">
            <div
              className="relative w-full overflow-hidden rounded-xl bg-zinc-100"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div
                ref={sliderRef}
                className="flex"
                style={{
                  width: `${banners.length * 50}%`,
                  transform: `translateX(-${index * 100}%)`,
                }}
              >
                {banners.map((b) => (
                  <div key={b.id} className="w-full shrink-0">
                    <div className="relative w-full aspect-[16/8] md:aspect-[20/7]">
                      <Image
                        src={"/flyer.svg"}
                        alt={b.alt}
                        width={800}
                        height={400}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-start">
                        <h3 className="m-4 md:m-6 rounded-md bg-white/80 px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base font-semibold text-zinc-900">
                          {b.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dots */}
              <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                {banners.map((b, i) => (
                  <span
                    key={b.id}
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-zinc-900" : "bg-zinc-400/70"}`}
                  />
                ))}
                <span className="sr-only">{`Slide ${index + 1} of ${banners.length}`}</span>
              </div>
            </div>
          </section>

          {/* Categories */}
          <Categories
            categories={categoriesWithHref}
            title="Categories"
            seeAllHref="/Eventspage"
            gridClass="grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10"
          />

          {/* All Events */}
          {eventsLoading ? (
            <div className="mb-6 md:mb-8">
              <h2 className="mb-3 md:mb-4 text-lg md:text-xl font-semibold text-zinc-900">
                All Events
              </h2>
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
                <span className="ml-2 text-sm text-zinc-600">
                  Loading events...
                </span>
              </div>
            </div>
          ) : events.length > 0 ? (
            <EventGrid
              events={eventsWithHref}
              title="All Events"
              seeAllHref="/home"
              gridClass="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
            />
          ) : (
            <div className="mb-6 md:mb-8">
              <h2 className="mb-3 md:mb-4 text-lg md:text-xl font-semibold text-zinc-900">
                All Events
              </h2>
              <div className="text-center py-8">
                <p className="text-zinc-600 mb-2">No events available</p>
                <p className="text-sm text-zinc-500">
                  Check back later for new events!
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Tab Bar */}
    </div>
  );
}
