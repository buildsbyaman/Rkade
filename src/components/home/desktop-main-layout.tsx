import React, { useState, useEffect, useMemo, useLayoutEffect } from "react";
import DesktopEventHero from "./desktop-event-hero";
import DesktopCategoryTabs from "./desktop-category-tabs";
import DesktopNearYou from "./desktop-near-you";
import DesktopSidebarFilters, {
  defaultFilters,
} from "./desktop-sidebar-filters";
import BookingsSquare from "./bookings-square";
import FlagshipEventsBanner from "./flagship-events-banner";
import {
  getEventsClient,
  getFeaturedEventsClient,
  transformEventToFrontend,
  type FeaturedEvent,
} from "@/lib/events-client";
import { getCampusById } from "@/lib/campuses";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";

// Helper function to safely extract poster URL
function getSafePosterUrl(poster: unknown): string | null {
  if (!poster) return null;
  if (typeof poster === "string") return poster;
  // Handle FileList or object cases
  return null;
}

const isToday = (dateString: string) => {
  const today = new Date();
  const eventDate = new Date(dateString);
  return (
    eventDate.getDate() === today.getDate() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getFullYear() === today.getFullYear()
  );
};

const isTomorrow = (dateString: string) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const eventDate = new Date(dateString);
  return (
    eventDate.getDate() === tomorrow.getDate() &&
    eventDate.getMonth() === tomorrow.getMonth() &&
    eventDate.getFullYear() === tomorrow.getFullYear()
  );
};

const isThisWeek = (dateString: string) => {
  const today = new Date();
  const eventDate = new Date(dateString);
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); // Sunday
  const endOfWeek = new Date(
    today.setDate(today.getDate() - today.getDay() + 6),
  ); // Saturday (after today is modified)

  return eventDate >= startOfWeek && eventDate <= endOfWeek;
};

const isThisMonth = (dateString: string) => {
  const today = new Date();
  const eventDate = new Date(dateString);
  return (
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getFullYear() === today.getFullYear()
  );
};

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
};

type Props = {
  events: Event[];
  showArtistNearYou?: boolean; // <-- Add this prop
};

export default function DesktopMainLayout({
  events: propEvents,
  showArtistNearYou = true,
}: Props) {
  const pathname = usePathname(); // Get the current pathname
  const pathSegment = pathname?.split("/")[1] || "home";
  // Map pathname to category ID - 'home' route should map to 'all' category
  const initialCategory = pathSegment === "home" ? "all" : pathSegment;
  const [selectedCategory, setSelectedCategory] = useState(initialCategory); // Initialize with URL segment
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll to desired position on component mount
  useLayoutEffect(() => {
    if (!isMounted || !pathname) return; // Wait for mounting and pathname

    if (pathname === "/home") return; // skip scroll on home page

    window.scrollTo({
      top: 150,
      behavior: "instant",
    });
  }, [isMounted, pathname]);

  // Fetch events from Supabase - only run once on mount
  useEffect(() => {
    if (hasFetched) return; // Prevent multiple fetches

    const fetchEvents = async () => {
      try {
        console.log("Fetching events from Supabase...");
        setLoading(true);
        const [allEvents, featured] = await Promise.all([
          getEventsClient(),
          getFeaturedEventsClient(3),
        ]);

        console.log(
          "Fetched events from database:",
          allEvents.length,
          "events",
        );
        console.log("Fetched featured events:", featured.length, "events");

        const transformedEvents = allEvents.map(transformEventToFrontend);
        setEvents(transformedEvents);
        setFeaturedEvents(featured);
        setHasFetched(true);
      } catch (error) {
        console.error("Error fetching events:", error);
        // Only fallback to prop events if database fetch fails completely
        if (propEvents && propEvents.length > 0) {
          console.log("Falling back to prop events due to database error");
          setEvents(propEvents);
        }
        setHasFetched(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); // Empty dependency array - only run once on mount

  // Category tabs data
  const categoryTabs = [
    { id: "all", label: "All Events", href: "/home", isActive: false },
    { id: "campus", label: "Campus Events", href: "/campus_event" },
    { id: "events", label: "Events", href: "/events" },
    { id: "movies", label: "Movies", href: "/movie" },
    { id: "sports", label: "Sports", href: "/sports" },
  ];

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // TODO: Filter events based on selected category
  };

  const handleFilterChange = (sectionId: string, selectedOptions: string[]) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [sectionId]: selectedOptions,
    }));
    // TODO: Apply filters to events
  };

  // Filter events based on selected category and filters - memoized to prevent unnecessary filtering
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Primary Category filter from tabs
      if (selectedCategory !== "all") {
        // If a specific category tab is selected, filter by its ID (e.g., 'sports', 'movies', 'events')
        // Ensure that event.eventType (from DB) matches the selectedCategory (from tab id)
        if (
          event.eventType &&
          event.eventType.toLowerCase() !== selectedCategory.toLowerCase()
        ) {
          return false;
        }
      }
      // If selectedCategory is 'all', include all events (no category filtering)

      // Apply sidebar filters
      for (const sectionId in selectedFilters) {
        const selectedOptions = selectedFilters[sectionId];
        if (selectedOptions.length > 0) {
          let match = false;
          switch (sectionId) {
            case "category":
              if (selectedOptions.includes(event.category.toLowerCase())) {
                match = true;
              }
              break;
            case "language":
              if (selectedOptions.includes(event.language.toLowerCase())) {
                match = true;
              }
              break;
            case "age-rating":
              if (selectedOptions.includes(event.ageLimit.toLowerCase())) {
                match = true;
              }
              break;
            case "price":
              // Handle price filtering - remove currency symbols before parsing
              for (const option of selectedOptions) {
                // Handle FREE events properly
                const isEventFree =
                  event.price === "FREE" ||
                  event.price === "0" ||
                  event.price.toLowerCase() === "free";
                const eventPrice = isEventFree
                  ? 0
                  : parseFloat(event.price.replace(/[^0-9.]/g, "")) || 0;

                if (option === "free" && isEventFree) {
                  match = true;
                  break;
                }
                if (
                  option === "under-1000" &&
                  !isEventFree &&
                  eventPrice > 0 &&
                  eventPrice < 1000
                ) {
                  match = true;
                  break;
                }
                if (
                  option === "under-2000" &&
                  !isEventFree &&
                  eventPrice >= 1000 &&
                  eventPrice < 2000
                ) {
                  match = true;
                  break;
                }
                if (
                  option === "above-2000" &&
                  !isEventFree &&
                  eventPrice >= 2000
                ) {
                  match = true;
                  break;
                }
              }
              break;
            case "date":
              if (event.date) {
                // Only apply date filter if event has a date
                for (const option of selectedOptions) {
                  if (option === "today" && isToday(event.date)) {
                    match = true;
                    break;
                  }
                  if (option === "tomorrow" && isTomorrow(event.date)) {
                    match = true;
                    break;
                  }
                  if (option === "this-week" && isThisWeek(event.date)) {
                    match = true;
                    break;
                  }
                  if (option === "this-month" && isThisMonth(event.date)) {
                    match = true;
                    break;
                  }
                  if (
                    option === "others" &&
                    !isToday(event.date) &&
                    !isTomorrow(event.date) &&
                    !isThisWeek(event.date) &&
                    !isThisMonth(event.date)
                  ) {
                    match = true;
                    break;
                  }
                }
              } else {
                // If event doesn't have a date and 'others' is selected, include it
                if (selectedOptions.includes("others")) {
                  match = true;
                }
              }
              break;
            default:
              // For other filter sections, you might need different logic
              match = true; // If a section is not handled, assume it matches
          }

          if (!match) {
            return false; // If no match in this filter section, exclude the event
          }
        }
      }

      return true; // If all filters pass, include the event
    });
  }, [events, selectedCategory, selectedFilters]); // Add selectedFilters to dependencies

  // Transform featured events for hero section - memoized to prevent unnecessary re-computations
  const transformedFeaturedEvents = useMemo(() => {
    return featuredEvents.map((event) => {
      // Safe poster image extraction with type checking
      const getPosterImage = () => {
        const portraitPoster =
          typeof event.portrait_poster === "string"
            ? event.portrait_poster
            : null;
        const landscapePoster =
          typeof event.landscape_poster === "string"
            ? event.landscape_poster
            : null;

        return portraitPoster || landscapePoster || "/placeholder.svg";
      };

      return {
        id: event.id,
        title: event.event_name,
        category: event.category || event.event_type || "Event",
        time: event.time || "7:00 PM",
        date: event.date
          ? new Date(event.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          : "15 October 2025",
        venue: event.venue || "Unknown Venue",
        language: event.language || "English",
        ageRating: event.ageLimit || "PG13",
        posterImage: getPosterImage(),
      };
    });
  }, [featuredEvents]);

  // Handle search functionality
  // const handleSearch = (query: string) => {
  //   // TODO: Implement search logic
  // }

  return (
    <div className="min-h-screen bg-gray-50 pt-[73px]">
      {/* Event Hero Section with Sliding - Full Width */}
      <div className="w-full ">
        <DesktopEventHero events={transformedFeaturedEvents} />
      </div>

      {/* Bookings and Flagship Events Section */}
      <div className="px-[100px] py-8 bg-gray-50">
        <div className="flex gap-6">
          <BookingsSquare />
          <FlagshipEventsBanner />
        </div>
      </div>

      {/* Category Tabs - Sticky across full width */}
      <div className="sticky top-[73px] z-30 bg-gray-50">
        <div className="w-full">
          <DesktopCategoryTabs
            categories={categoryTabs}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </div>
      {/* Main Content Area with Sidebar */}
      <div className="px-[100px] py-12 min-h-screen">
        <div className="flex gap-8">
          {/* Left Sidebar - Filters and Artists Near You side by side */}
          <div className="w-fit sticky top-[140px] h-fit">
            <div className="flex gap-6">
              {/* Artists Near You Section */}
              {showArtistNearYou && (
                <div className="w-[200px] bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <DesktopNearYou />
                </div>
              )}
              {/* Filters Section */}
              <div className="w-[200px]">
                <DesktopSidebarFilters
                  filters={defaultFilters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1">
            {/* Events Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                <span className="ml-2 text-gray-600">Loading events...</span>
              </div>
            ) : filteredEvents.length > 0 ? (
              <div>
                {/* Show active filter count */}
                {Object.values(selectedFilters).some(
                  (arr) => arr.length > 0,
                ) && (
                    <div className="mb-4 flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {filteredEvents.length} event
                        {filteredEvents.length !== 1 ? "s" : ""} found
                      </span>
                      <button
                        onClick={() => setSelectedFilters({})}
                        className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-[28px] gap-x-[26px]">
                  {filteredEvents.map((event, index) => (
                    <EventCard
                      key={event.id}
                      title={event.name}
                      slug={event.href?.split('/').pop() || event.id}
                      image={event.img}
                      date={event.date}
                      category={event.category}
                      location={event.venue}
                      campus={event.campusSlug}
                      price={event.price}
                      description={event.description}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-gray-500 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Events Found
                </h3>
                <p className="text-gray-600 mb-4">
                  The database doesn&apos;t have any events yet.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>To add sample events:</strong>
                  </p>
                  <ol className="text-sm text-blue-700 text-left space-y-1">
                    <li>
                      1. Run:{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        supabase start
                      </code>
                    </li>
                    <li>
                      2. Run:{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        supabase db reset
                      </code>
                    </li>
                    <li>
                      3. Run:{" "}
                      <code className="bg-blue-100 px-1 rounded">
                        psql -h localhost -p 54322 -U postgres -d postgres -f
                        sample-events.sql
                      </code>
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* Load More Button */}
            {!loading && filteredEvents.length > 0 && (
              <div className="text-center mt-12">
                <button className="bg-gray-900 hover:bg-sky-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200">
                  Load More Events
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
