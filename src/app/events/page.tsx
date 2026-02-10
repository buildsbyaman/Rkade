"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EventCard } from "@/components/EventCard";
import { NavigationOverlayPill } from "@/components/NavigationOverlayPill";


type EventRow = {
  id: string;
  slug: string;
  eventName: string;
  landscapePoster: string | null;
  portraitPoster: string | null;
  date: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  time: string | null;
  duration: string | null;
  ageLimit: string | null;
  language: string | null;
  category: string | null;
  eventType?: string | null;
  venue: string | null;
  campus?: string | null;
  price: string | null;
  description: string | null;
  performers: string | null;
  createdAt?: string;
};

type Option = { id: string; name?: string; slug: string; code?: string };

function EventsPageContent() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date());

  // Filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [eventType, setEventType] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [age, setAge] = useState("");
  const [dateOnly, setDateOnly] = useState("");
  const [sort, setSort] = useState<
    "latest" | "oldest" | "price_low_high" | "price_high_low"
  >("latest");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Sync URL search params with state
  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);

  // Master data
  const [eventTypes, setEventTypes] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [languages, setLanguages] = useState<Option[]>([]);
  const [ageRatings, setAgeRatings] = useState<Option[]>([]);

  // Calendar helper function
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift(prevDate.getDate());
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    // Add days from next month to fill the grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(i);
    }

    return days.slice(0, 42);
  };

  const calendarDays = getCalendarDays(viewMonth);
  const monthName = viewMonth.toLocaleString("default", { month: "long" });
  const year = viewMonth.getFullYear();

  const handleDateSelect = (day: number) => {
    const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    const dateString = date.toISOString().split("T")[0];
    setDateOnly(dateString);
    setShowDatePicker(false);
  };

  const handlePrevMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1));
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "dd-mm-yyyy";
    const date = new Date(dateString + "T00:00:00");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Load master data once
  useEffect(() => {
    let cancelled = false;
    async function loadMaster() {
      try {
        const [et, cat, lang, ageR] = await Promise.all([
          fetch("/api/filters/event-types").then((res) => res.json()),
          fetch("/api/filters/categories").then((res) => res.json()),
          fetch("/api/filters/languages").then((res) => res.json()),
          fetch("/api/filters/age-ratings").then((res) => res.json()),
        ]);
        if (!cancelled) {
          setEventTypes(et || []);
          setCategories(cat || []);
          setLanguages(lang || []);
          setAgeRatings(ageR || []);
        }
      } catch (error: unknown) {
        if (!cancelled)
          setError(
            error instanceof Error ? error.message : "Failed to load filters",
          );
      }
    }
    loadMaster();
    return () => {
      cancelled = true;
    };
  }, []);

  // Build and run query whenever filters/sort change
  useEffect(() => {
    let cancelled = false;
    async function loadEvents() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch.trim())
          params.set("search", debouncedSearch.trim());
        if (eventType) params.set("eventType", eventType);
        if (category) params.set("category", category);
        if (language) params.set("language", language);
        if (age) params.set("age", age);
        if (dateOnly) params.set("dateOnly", dateOnly);
        params.set("sort", sort);

        console.log("Fetching events with params:", params.toString());

        const response = await fetch(`/api/events/search?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.details || errorData.error || "Failed to fetch events",
          );
        }

        const data = await response.json();
        console.log(`Received ${data?.length || 0} events`);

        if (!cancelled) {
          if (Array.isArray(data)) {
            setEvents(data);
          } else if (data.error) {
            throw new Error(data.error);
          } else {
            setEvents([]);
          }
        }
      } catch (error: unknown) {
        console.error("Error loading events:", error);
        if (!cancelled)
          setError(
            error instanceof Error ? error.message : "Failed to load events",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadEvents();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, eventType, category, language, age, dateOnly, sort]);

  const hasFilters = useMemo(
    () =>
      !!(
        debouncedSearch ||
        eventType ||
        category ||
        language ||
        age ||
        dateOnly
      ),
    [debouncedSearch, eventType, category, language, age, dateOnly],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch) count++;
    if (eventType) count++;
    if (category) count++;
    if (language) count++;
    if (age) count++;
    if (dateOnly) count++;
    return count;
  }, [debouncedSearch, eventType, category, language, age, dateOnly]);

  return (
    <div className="min-h-screen bg-obsidian text-white">
      <div className="relative bg-black/40 py-6 md:py-10">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="font-display text-5xl font-bold tracking-wide text-white md:text-7xl mb-2 md:mb-4">
            Discover <span className="text-acid">Events</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-12 pt-0 md:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="lg:col-span-1 absolute top-0 left-0 right-0 z-40 lg:relative lg:z-auto">
              <div className="bg-[#0e1111] p-6 rounded-2xl border border-white/10 sticky top-24 space-y-4 shadow-2xl lg:shadow-none">
                <div className="flex items-center justify-between lg:hidden mb-4">
                  <h3 className="font-bold text-white">Filters</h3>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowFilters(false)}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </Button>
                </div>
              {/* ... Keep existing sidebar content structure ... */}
                {/* Category */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-acid">
                    category
                  </span>
                  Category
                </label>

                {/* Dropdown Button */}
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className={`w-full p-3 text-sm rounded-xl bg-white/5 border ${category ? "border-acid/50" : "border-white/10"} text-white focus:outline-none focus:ring-2 focus:ring-acid/50 focus:border-acid transition-all flex items-center justify-between`}
                >
                  <span>
                    {category ? (
                      category.charAt(0).toUpperCase() + category.slice(1)
                    ) : (
                      "All Categories"
                    )}
                  </span>
                  <span className={`material-symbols-outlined text-lg transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-lg z-50">
                    <button
                      onClick={() => {
                        setCategory("");
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-sm text-left transition-all ${category === ""
                        ? "bg-acid text-black font-semibold"
                        : "text-white hover:bg-acid/20"
                        }`}
                    >
                      All Categories
                    </button>
                    {[
                      { value: "campuses", label: "Campuses" },
                      { value: "fests", label: "Fests" },
                      { value: "hackathons", label: "Hackathons" },
                      { value: "meetups", label: "Meetups" },
                      { value: "cohorts", label: "Cohorts" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setCategory(option.value);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-sm text-left transition-all ${category === option.value
                          ? "bg-acid text-black font-semibold"
                          : "text-white hover:bg-acid/20"
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-acid">
                    calendar_today
                  </span>
                  Date
                </label>

                {/* Date Input Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowDatePicker(!showDatePicker);
                      if (!showDatePicker && dateOnly) {
                        const date = new Date(dateOnly + "T00:00:00");
                        setViewMonth(date);
                      }
                    }}
                    className={`w-full p-3 text-sm rounded-xl bg-white/5 border ${dateOnly ? "border-acid/50" : "border-white/10"} text-white focus:outline-none focus:ring-2 focus:ring-acid/50 focus:border-acid transition-all flex items-center justify-between`}
                  >
                    <span className="text-left flex-1">{formatDateDisplay(dateOnly)}</span>
                    <span className="material-symbols-outlined text-lg text-acid">
                      event
                    </span>
                  </button>
                </div>

                {/* Custom Calendar Picker */}
                {showDatePicker && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 p-4 min-w-[280px]">
                    {/* Month/Year Header */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={handlePrevMonth}
                        className="p-1 text-white hover:bg-white/10 rounded transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">
                          expand_less
                        </span>
                      </button>
                      <div className="text-white font-semibold">
                        {monthName}, {year}
                      </div>
                      <button
                        onClick={handleNextMonth}
                        className="p-1 text-white hover:bg-white/10 rounded transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">
                          expand_more
                        </span>
                      </button>
                    </div>

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-semibold text-gray-400"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {calendarDays.map((day, idx) => {
                        const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
                        const dateString = date.toISOString().split("T")[0];
                        const isSelected = dateString === dateOnly;
                        const isToday =
                          date.toDateString() === new Date().toDateString();
                        const isCurrentMonth =
                          date.getMonth() === viewMonth.getMonth();

                        return (
                          <button
                            key={idx}
                            onClick={() => handleDateSelect(day)}
                            className={`w-8 h-8 rounded text-xs font-medium transition-all ${isSelected
                              ? "bg-acid text-black font-bold"
                              : isToday
                                ? "bg-acid/30 text-acid border border-acid/50"
                                : isCurrentMonth
                                  ? "text-white hover:bg-white/10"
                                  : "text-gray-600 hover:bg-white/5"
                              }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    {/* Clear & Today Buttons */}
                    <div className="flex gap-2 border-t border-white/10 pt-4">
                      <button
                        onClick={() => {
                          setDateOnly("");
                          setShowDatePicker(false);
                        }}
                        className="flex-1 px-3 py-2 text-xs font-medium text-acid hover:text-white hover:bg-white/10 rounded transition-all"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => {
                          const today = new Date().toISOString().split("T")[0];
                          setDateOnly(today);
                          setViewMonth(new Date());
                          setShowDatePicker(false);
                        }}
                        className="flex-1 px-3 py-2 text-xs font-medium text-acid hover:text-white hover:bg-white/10 rounded transition-all"
                      >
                        Today
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort */}
              <div className="space-y-2 relative">
                <label className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-acid">
                    sort
                  </span>
                  Sort By
                </label>

                {/* Sort Dropdown Button */}
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className={`w-full p-3 text-sm rounded-xl bg-white/5 border ${sort !== "latest" ? "border-acid/50" : "border-white/10"} text-white focus:outline-none focus:ring-2 focus:ring-acid/50 focus:border-acid transition-all flex items-center justify-between`}
                >
                  <span>
                    {sort === "latest"
                      ? "Latest"
                      : sort === "oldest"
                        ? "Oldest"
                        : sort === "price_low_high"
                          ? "Price Low to High"
                          : "Price High to Low"}
                  </span>
                  <span className={`material-symbols-outlined text-lg transition-transform ${showSortDropdown ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>

                {/* Sort Dropdown Menu */}
                {showSortDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-lg z-50">
                    {[
                      { value: "latest", label: "Latest" },
                      { value: "oldest", label: "Oldest" },
                      { value: "price_low_high", label: "Price Low to High" },
                      { value: "price_high_low", label: "Price High to Low" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSort(
                            option.value as
                            | "latest"
                            | "oldest"
                            | "price_low_high"
                            | "price_high_low",
                          );
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-sm text-left transition-all ${sort === option.value
                          ? "bg-acid text-black font-semibold"
                          : "text-white hover:bg-acid/20"
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear Button */}
              {activeFilterCount > 0 && (
                <Button
                  type="button"
                  className="w-full text-sm py-2 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                  onClick={() => {
                    setSearch("");
                    setEventType("");
                    setCategory("");
                    setLanguage("");
                    setAge("");
                    setDateOnly("");
                  }}
                >
                  <span className="material-symbols-outlined mr-1.5 text-sm">
                    clear
                  </span>
                  Clear All
                </Button>
              )}
            </div>
          </aside>
          )}

          {/* Main Content */}
          <main className={`transition-all duration-300 ${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`h-9 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white gap-2 transition-all ${showFilters ? 'bg-acid/20 border-acid/50 text-acid' : ''}`}
                >
                    <span className="material-symbols-outlined text-lg">tune</span>
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                    <span className="bg-acid text-black text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center -mr-1">
                        {activeFilterCount}
                    </span>
                    )}
                </Button>
                <div>
                    <h3 className="text-lg font-semibold text-white">
                    {loading ? (
                        "Loading..."
                    ) : (
                        <>
                        {events.length} Event{events.length !== 1 ? "s" : ""}
                        </>
                    )}
                    </h3>
                </div>
              </div>
              <div>
                {hasFilters && !loading && (
                  <p className="text-sm text-zinc-400">
                    Filtered results
                  </p>
                )}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="glass-card p-8 rounded-2xl border-red-500/20">
                <div className="text-center mb-4">
                  <span className="material-symbols-outlined text-5xl text-red-500 mb-4 block">
                    error
                  </span>
                  <p className="text-red-400 font-medium mb-2">{error}</p>
                </div>
                <div className="text-left text-xs text-zinc-500 bg-black/30 p-4 rounded-lg font-mono overflow-auto">
                    <p className="mb-2"><strong>Debug Info:</strong></p>
                    <p>Search: {debouncedSearch || "(none)"}</p>
                    <p>Event Type: {eventType || "(none)"}</p>
                    <p>Category: {category || "(none)"}</p>
                    <p>Language: {language || "(none)"}</p>
                    <p>Age: {age || "(none)"}</p>
                    <p>Date: {dateOnly || "(none)"}</p>
                    <p>Sort: {sort}</p>
                </div>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4 w-full bg-red-500/20 hover:bg-red-500/30 text-red-400"
                >
                  Reload Page
                </Button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden bg-[#1a1a1a] animate-pulse"
                  >
                    <div className="aspect-[3/4] bg-white/5"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-white/5 rounded w-3/4"></div>
                      <div className="h-3 bg-white/5 rounded w-1/2"></div>
                      <div className="h-3 bg-white/5 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && events.length === 0 && (
              <div className="glass-card p-12 rounded-2xl border-white/10 text-center">
                <span className="material-symbols-outlined text-7xl text-zinc-600 mb-4">
                  {hasFilters ? "filter_alt_off" : "event_busy"}
                </span>
                <h3 className="text-xl font-bold text-white mb-2">
                  {hasFilters ? "No Events Found" : "No Events Available"}
                </h3>
                <p className="text-zinc-400 mb-6">
                  {hasFilters
                    ? "Try adjusting your filters to see more results"
                    : "Check back later for upcoming events"}
                </p>
                {hasFilters && (
                  <Button
                    onClick={() => {
                      setSearch("");
                      setEventType("");
                      setCategory("");
                      setLanguage("");
                      setAge("");
                      setDateOnly("");
                    }}
                    className="bg-acid text-black hover:bg-acid-hover"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}

            {/* Events Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={events.length}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {events.map((ev, index) => {
                  return (
                    <EventCard
                      key={ev.id}
                      title={ev.eventName}
                      slug={ev.slug}
                      image={ev.landscapePoster || ev.portraitPoster || "/Assests/1.jpg"}
                      date={ev.date || ev.dateFrom || undefined}
                      category={ev.category || "Event"}
                      location={ev.venue || ""}
                      campus={ev.campus ?? undefined}
                      price={ev.price ?? undefined}
                      index={index}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <NavigationOverlayPill />
    </div>
  );
}

export default function EventsIndexPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-obsidian text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 bg-noise flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-acid"></div>
      </div>
    }>
      <EventsPageContent />
    </Suspense>
  );
}
