"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCampusById } from "@/lib/campuses";
import { baseEvents as sharedBaseEvents, getEventById } from "@/lib/events";
import { useSession } from "next-auth/react";

import { Inter } from "next/font/google";
import { TeamManagement } from "@/components/events/TeamManagement";

const inter = Inter({ subsets: ["latin"] });

// Add type definitions
type Event = {
  id: string;
  category: string;
  name: string;
  price: string;
  img: string;
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
  eventType?: string;
};

type Campus = {
  id: string;
  name: string;
  fullName: string;
  image: string;
  location: string;
};

// use shared events list from src/lib/events
const baseEvents = sharedBaseEvents as Event[];

interface Props {
  /** slug in the form of '{campusId}-{eventId}' */
  slug?: string;
  /** alternatively pass campus and event directly */
  campus?: Campus;
  event?: Event;
  /** optional server event data with team-related fields */
  serverEvent?: {
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
    language?: string;
    performers?: string;
    is_team_event?: boolean;
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
  /** callback when campus is missing instead of redirecting */
  onCampusMissing?: () => void;
}

export default function CampusEventComponent({
  slug,
  campus: propCampus,
  event: propEvent,
  serverEvent,
  onCampusMissing,
}: Props) {
  const router = useRouter();
  const [campus, setCampus] = useState<Campus | null>(propCampus || null);
  const [event, setEvent] = useState<Event | null>(propEvent || null);
  const [fetchedEventData, setFetchedEventData] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "description" | "timeline" | "speakers"
  >("description");

  // Debug: Log the received data
  console.log("CampusEventComponent - serverEvent:", serverEvent);
  console.log("CampusEventComponent - event:", event);
  console.log("CampusEventComponent - fetchedEventData:", fetchedEventData);
  console.log("CampusEventComponent - campus:", campus);
  const { data: session } = useSession();

  // lock background scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  const handleConfirmBooking = async () => {
    if (isBooking) return;
    setIsBooking(true);
    try {
      // TODO: call booking API here. For now simulate a short delay.
      await new Promise((res) => setTimeout(res, 800));
      setShowModal(false);
      // navigate to profile or show success message in UI
      console.log(`Booked ${qty} seat(s) for ₹${total}`);
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    // If props supplied directly, prefer them
    if (propCampus) setCampus(propCampus);
    if (propEvent) setEvent(propEvent);

    // If serverEvent is provided, use it directly
    if (serverEvent) {
      // Set a dummy campus if not provided
      if (!propCampus) {
        setCampus({
          id: "default",
          name: "",
          fullName: "Event",
          image: "",
          location: "",
        });
      }
      return;
    }

    // If slug provided, try to fetch event directly from API
    const s = slug;
    if (!s) return;

    // Try to fetch event by slug from API
    fetch(`/api/events/slug/${s}`)
      .then((res) => {
        if (!res.ok) throw new Error("Event not found");
        return res.json();
      })
      .then((data) => {
        console.log("Fetched event data:", data);
        // API returns the event directly, not wrapped in { event: ... }
        if (data && data.id) {
          // Store the full fetched data for image and other fields
          setFetchedEventData(data);

          setEvent({
            id: data.id || data._id,
            category: data.category || data.event_type || "Event",
            price: data.price || "0",
            img:
              data.portrait_poster ||
              data.portraitPoster ||
              data.landscape_poster ||
              data.landscapePoster ||
              "/Assests/1.jpg",
            name:
              data.eventName ||
              data.event_name ||
              data.name ||
              data.title ||
              "Event",
            slug: data.slug,
            date: data.date,
            time: data.time,
            venue: data.venue,
            description: data.description,
            language: data.language,
            ageLimit: data.age_limit,
            duration: data.duration,
            performers: data.performers,
          });
          // If event has a campus, try to set it, otherwise set a dummy campus
          if (data.campus_id) {
            const c = getCampusById(data.campus_id);
            if (c) setCampus(c);
            else {
              // Set dummy campus so loading doesn't hang
              setCampus({
                id: "default",
                name: "",
                fullName: "Event",
                image: "",
                location: "",
              });
            }
          } else {
            // No campus_id, set dummy campus
            setCampus({
              id: "default",
              name: "",
              fullName: "Event",
              image: "",
              location: "",
            });
          }
        }
      })
      .catch((err) => {
        console.error("Failed to fetch event:", err);
        // If API fetch fails, try parsing as campus-event format
        const parts = s.split("-");
        const eventId = parts[parts.length - 1];
        const campusId = parts.slice(0, parts.length - 1).join("-");

        const c = getCampusById(campusId);
        if (!c) {
          if (onCampusMissing) {
            onCampusMissing();
          }
          return;
        }
        setCampus(c);

        const ev = getEventById(eventId) || (slug ? null : baseEvents[0]); // Don't fallback to dummy if slug is real
        if (ev) {
          // avoid using `any` — treat unknown optional fields via Record<string, unknown>
          const evRecord = ev as Record<string, unknown>;
          const fallbackEventType =
            typeof evRecord["event_type"] === "string"
              ? String(evRecord["event_type"])
              : undefined;
          const portrait =
            typeof evRecord["portrait_poster"] === "string"
              ? String(evRecord["portrait_poster"])
              : undefined;
          const landscape =
            typeof evRecord["landscape_poster"] === "string"
              ? String(evRecord["landscape_poster"])
              : undefined;

          setEvent({
            id: String(ev.id ?? ""),
            category: String(ev.category ?? fallbackEventType ?? "Event"),
            price: String(ev.price ?? "0"),
            img: String(portrait ?? landscape ?? ev.img ?? "/Assests/1.jpg"),
            name: `${c.name} ${String(ev.name ?? "")}`,
          });
        }
      });
  }, [slug, propCampus, propEvent, serverEvent, onCampusMissing, router]);

  if (!event) {
    return (
      <div className="min-h-dvh bg-transparent flex items-center justify-center">
        <p className="text-sm text-gray-400 font-mono uppercase tracking-widest animate-pulse">
          Loading event...
        </p>
      </div>
    );
  }

  // parse numeric price (simple) - handle possibly undefined price
  const numericPrice = Number((event.price || "").replace(/[^0-9]/g, "")) || 0;
  const total = numericPrice * qty;

  // Use database poster values directly - prioritize fetched data, then serverEvent, then event.img
  const eventImageSrc =
    fetchedEventData?.portrait_poster ||
    fetchedEventData?.portraitPoster ||
    fetchedEventData?.landscape_poster ||
    fetchedEventData?.landscapePoster ||
    serverEvent?.portrait_poster ||
    serverEvent?.portraitPoster ||
    serverEvent?.landscape_poster ||
    serverEvent?.landscapePoster ||
    event.img ||
    "/Assests/1.jpg";

  return (
    <>
      <div
        className={`hidden lg:block min-h-screen relative ${inter.className} bg-transparent text-white`}
      >
        {/* Desktop Header - handled by layout */}
        {/* <Navbar /> */}

        {/* Desktop Main Content */}
        <div className="max-w-7xl mx-auto px-8 py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column - Event Image & Details */}
            <div className="lg:col-span-5 space-y-8">
              <div className="sticky top-24 space-y-8">
                <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 relative group aspect-[3/4]">
                  <Image
                    src={eventImageSrc}
                    alt={event.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">
                      Language
                    </p>
                    <p className="text-white font-medium">
                      {event.language || "English"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">
                      Age Limit
                    </p>
                    <p className="text-white font-medium">
                      {event.ageLimit || "All Ages"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">
                      Duration
                    </p>
                    <p className="text-white font-medium">
                      {event.duration || "TBA"}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">
                      Performers
                    </p>
                    <p className="text-white font-medium">
                      {event.performers || "TBA"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card & Info */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                {event.category && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-acid/20 bg-acid/10 text-acid text-xs font-bold uppercase tracking-wider mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-acid animate-pulse" />
                    {event.category}
                  </span>
                )}
                <h1 className="text-6xl md:text-8xl font-display font-bold uppercase italic leading-none mb-6 text-white tracking-tight">
                  {event.name}
                </h1>

                <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm text-gray-300 mb-8 border-b border-white/10 pb-8">
                  {(event.date || event.time) && (
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-white/5 text-acid border border-white/5">
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7 10h10M12 3v4M3 7h18v13c0 1.1046-.8954 2-2 2H5c-1.10457 0-2-.8954-2-2V7z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                          Date & Time
                        </p>
                        <p className="font-semibold text-white text-base">
                          {event.date
                            ? new Date(event.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            })
                            : "TBA"}
                          {event.time ? ` • ${event.time}` : ""}
                        </p>
                      </div>
                    </div>
                  )}
                  {event.venue && (
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-white/5 text-acid border border-white/5">
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M21 10c0 6-9 11-9 11s-9-5-9-11a9 9 0 1 1 18 0z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle
                            cx="12"
                            cy="10"
                            r="2.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                          Location
                        </p>
                        <p className="font-semibold text-white text-base">
                          {event.venue}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabbed Content Section */}
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
                  {/* Tab Navigation */}
                  <div className="flex border-b border-white/10 bg-black/20">
                    <button
                      onClick={() => setActiveTab("description")}
                      className={`flex-1 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === "description"
                          ? "text-acid border-b-2 border-acid bg-acid/5"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      Description
                    </button>
                    <button
                      onClick={() => setActiveTab("timeline")}
                      className={`flex-1 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === "timeline"
                          ? "text-acid border-b-2 border-acid bg-acid/5"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      Timeline
                    </button>
                    <button
                      onClick={() => setActiveTab("speakers")}
                      className={`flex-1 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === "speakers"
                          ? "text-acid border-b-2 border-acid bg-acid/5"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      Speakers & Guests
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-8">
                    {/* Description Tab */}
                    {activeTab === "description" && (
                      <div className="prose prose-invert prose-lg max-w-none text-gray-400 leading-relaxed">
                        <p>
                          {event.description || "No description available."}
                        </p>
                      </div>
                    )}

                    {/* Timeline Tab */}
                    {activeTab === "timeline" && (
                      <div>
                        {((serverEvent?.timeline ||
                          fetchedEventData?.timeline) &&
                          ((serverEvent?.timeline?.length ?? 0) > 0 ||
                            (fetchedEventData?.timeline?.length ?? 0) > 0)) ||
                          serverEvent?.registration_start ||
                          fetchedEventData?.registration_start ||
                          serverEvent?.registration_end ||
                          fetchedEventData?.registration_end ||
                          event.date ? (
                          <div className="space-y-6">
                            {(serverEvent?.timeline ||
                              fetchedEventData?.timeline) &&
                              ((serverEvent?.timeline?.length ?? 0) > 0 ||
                                (fetchedEventData?.timeline?.length ?? 0) > 0) ? (
                              (
                                serverEvent?.timeline ||
                                fetchedEventData?.timeline
                              ).map((stage: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex gap-4 items-start"
                                >
                                  <div className="flex flex-col items-center">
                                    <div
                                      className={`w-3 h-3 rounded-full border-2 ${stage.status === "completed"
                                          ? "bg-green-500 border-green-500/20"
                                          : stage.status === "active"
                                            ? "bg-acid border-acid/20 animate-pulse"
                                            : "bg-white/20 border-white/10"
                                        }`}
                                    />
                                    {index <
                                      ((serverEvent?.timeline?.length ?? 0) ||
                                        (fetchedEventData?.timeline?.length ?? 0) ||
                                        0) -
                                      1 && (
                                        <div
                                          className={`w-0.5 h-full mt-2 ${stage.status === "completed"
                                              ? "bg-gradient-to-b from-green-500/50 to-transparent"
                                              : "bg-gradient-to-b from-acid/50 to-transparent"
                                            }`}
                                        />
                                      )}
                                  </div>
                                  <div className="flex-1 pb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                                        {stage.title}
                                      </p>
                                      {stage.status === "completed" && (
                                        <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">
                                          Completed
                                        </span>
                                      )}
                                      {stage.status === "active" && (
                                        <span className="text-[10px] bg-acid/20 text-acid px-2 py-0.5 rounded-full font-bold">
                                          Active
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-white font-semibold text-lg mb-2">
                                      {stage.date ? (
                                        <>
                                          {new Date(stage.date).toLocaleDateString(
                                            "en-GB",
                                            {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric",
                                              ...(stage.time && {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              }),
                                            },
                                          )}
                                          {stage.time &&
                                            !stage.date.includes("T") &&
                                            ` · ${stage.time}`}
                                        </>
                                      ) : (
                                        stage.time && `${stage.time}`
                                      )}
                                    </p>
                                    {stage.description && (
                                      <p className="text-sm text-gray-400 leading-relaxed">
                                        {stage.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <>
                                {(serverEvent?.registration_start ||
                                  fetchedEventData?.registration_start) && (
                                    <div className="flex gap-4 items-start">
                                      <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-acid border-2 border-acid/20" />
                                        <div className="w-0.5 h-full bg-gradient-to-b from-acid/50 to-transparent mt-2" />
                                      </div>
                                      <div className="flex-1 pb-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">
                                          Registration Opens
                                        </p>
                                        <p className="text-white font-semibold text-lg">
                                          {new Date(
                                            serverEvent?.registration_start ||
                                            fetchedEventData?.registration_start,
                                          ).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                {(serverEvent?.registration_end ||
                                  fetchedEventData?.registration_end) && (
                                    <div className="flex gap-4 items-start">
                                      <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-acid border-2 border-acid/20" />
                                        <div className="w-0.5 h-full bg-gradient-to-b from-acid/50 to-transparent mt-2" />
                                      </div>
                                      <div className="flex-1 pb-4">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">
                                          Registration Closes
                                        </p>
                                        <p className="text-white font-semibold text-lg">
                                          {new Date(
                                            serverEvent?.registration_end ||
                                            fetchedEventData?.registration_end,
                                          ).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                {event.date && (
                                  <div className="flex gap-4 items-start">
                                    <div className="flex flex-col items-center">
                                      <div className="w-3 h-3 rounded-full bg-acid border-2 border-acid/20" />
                                      <div className="w-0.5 h-full bg-gradient-to-b from-acid/50 to-transparent mt-2" />
                                    </div>
                                    <div className="flex-1 pb-4">
                                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">
                                        Event Date
                                      </p>
                                      <p className="text-white font-semibold text-lg">
                                        {new Date(
                                          event.date,
                                        ).toLocaleDateString("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })}
                                        {event.time && ` · ${event.time}`}
                                      </p>
                                    </div>
                                  </div>
                                )}
                                {(serverEvent?.result_date ||
                                  fetchedEventData?.result_date) && (
                                    <div className="flex gap-4 items-start">
                                      <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-500/20" />
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">
                                          Results Announced
                                        </p>
                                        <p className="text-white font-semibold text-lg">
                                          {new Date(
                                            serverEvent?.result_date ||
                                            fetchedEventData?.result_date,
                                          ).toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-center py-8">
                            No timeline information available.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Speakers & Guests Tab */}
                    {activeTab === "speakers" && (
                      <div>
                        {event.performers ||
                          serverEvent?.performers ||
                          fetchedEventData?.performers ? (
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              <div className="p-3 rounded-xl bg-acid/10 border border-acid/20">
                                <span className="material-symbols-outlined text-acid text-2xl">
                                  person
                                </span>
                              </div>
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-2">
                                  Performers
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                  {event.performers ||
                                    serverEvent?.performers ||
                                    fetchedEventData?.performers}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-center py-8">
                            No speaker or guest information available.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking / Action Section */}
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-acid/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Total Price</p>
                      <p className="text-4xl font-display font-bold text-white">
                        {numericPrice > 0 ? (
                          `₹${numericPrice}`
                        ) : (
                          <span className="text-acid">FREE</span>
                        )}
                      </p>
                    </div>

                    {!serverEvent?.is_team_event && serverEvent?.category !== "Hackathons" && serverEvent?.category !== "Hackathon" && (
                      <div className="flex items-center bg-black/40 rounded-xl p-1.5 border border-white/10">
                        <button
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xl font-medium"
                        >
                          -
                        </button>
                        <div className="w-12 text-center font-mono text-white text-lg font-bold">
                          {qty}
                        </div>
                        <button
                          onClick={() => setQty((q) => q + 1)}
                          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xl font-medium"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (
                        serverEvent?.is_team_event &&
                        (serverEvent.event_type === "campus_event" ||
                          serverEvent.event_type === "campus-event" ||
                          serverEvent.event_type === "Campus Event")
                      ) {
                        const teamSection = document.querySelector(
                          "[data-team-management]",
                        );
                        if (teamSection)
                          teamSection.scrollIntoView({ behavior: "smooth" });
                        return;
                      }

                      if (serverEvent?.slug) {
                        router.push(
                          `/events/${serverEvent.slug}/book?qty=${qty}`,
                        );
                      } else if (event?.slug && !event.slug.includes("local")) {
                        router.push(`/events/${event.slug}/book?qty=${qty}`);
                      } else {
                        setShowModal(true);
                      }
                    }}
                    className="w-full bg-acid hover:bg-acid-hover text-black py-4 rounded-xl font-bold text-lg uppercase tracking-wide transition-all hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative">
                      {serverEvent?.is_team_event
                        ? "Join or Create Team"
                        : "Book Now"}
                    </span>
                    <span className="material-symbols-outlined relative transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </button>

                  <p className="text-center text-xs text-gray-500 mt-4">
                    By booking, you agree to our Terms & Conditions
                  </p>
                </div>
              </div>

              {/* Event Timeline - REMOVED, now in tabs */}
              {/* Team Management (Desktop) */}
              {serverEvent &&
                serverEvent.is_team_event &&
                (serverEvent.event_type === "campus_event" ||
                  serverEvent.event_type === "campus-event" ||
                  serverEvent.event_type === "Campus Event") && (
                  <section
                    className="bg-white/5 border border-white/10 rounded-2xl p-8"
                    data-team-management
                  >
                    <h2 className="text-2xl font-display font-bold text-white mb-6">
                      Team Management
                    </h2>
                    <TeamManagement
                      eventId={serverEvent.id || event.id}
                      isTeamEvent={serverEvent.is_team_event}
                      minTeamSize={serverEvent.min_team_size}
                      maxTeamSize={serverEvent.max_team_size}
                    />
                  </section>
                )}
            </div>
          </div>
        </div>

        {/* Desktop Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <div className="relative w-full max-w-lg bg-obsidian rounded-2xl shadow-2xl overflow-hidden z-10 border border-white/10">
              <div className="p-6 border-b border-white/10 bg-white/5">
                <h3 className="text-2xl font-bold font-display text-white">
                  Confirm Booking
                </h3>
                <p className="text-gray-400 mt-1 text-sm">
                  Review your seats and total before confirming
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-semibold text-white">
                    ₹{numericPrice}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Quantity</span>
                  <span className="font-semibold text-white">{qty}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-gray-400">Taxes</span>
                  <span className="font-semibold text-acid">FREE</span>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">
                    Total
                  </span>
                  <span className="text-3xl font-bold text-acid">₹{total}</span>
                </div>
              </div>
              <div className="p-6 border-t border-white/10 flex gap-4 bg-black/20">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 font-semibold text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={isBooking}
                  className="flex-1 py-3.5 rounded-xl bg-acid hover:bg-acid-hover text-black font-bold uppercase tracking-wide transition-all shadow-lg shadow-acid/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="lg:hidden min-h-dvh bg-transparent text-white">
        <div className="mx-auto w-full max-w-[420px] bg-obsidian/40 backdrop-blur-xl min-h-screen relative shadow-2xl shadow-black border-x border-white/5">
          {/* <Navbar /> */}

          <main className="px-4 pb-24 pt-20">
            {/* Mobile Event Image */}
            <div className="mb-6 relative group">
              <div className="rounded-2xl border border-white/10 overflow-hidden shadow-lg shadow-black/50 aspect-video relative">
                <Image
                  src={eventImageSrc}
                  alt={event.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-transparent to-transparent" />

                {/* Category Badge overlay on image */}
                {event.category && (
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-acid/90 backdrop-blur-md text-black text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-acid/20">
                      {event.category}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-5xl font-display font-bold uppercase italic leading-none mb-4 text-white">
              {event.name}
            </h1>

            <div className="space-y-4 mb-8">
              {/* Quick Stats Rows */}
              {(event.date || event.time) && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-lg bg-white/5 text-acid">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 10h10M12 3v4M3 7h18v13c0 1.1046-.8954 2-2 2H5c-1.10457 0-2-.8954-2-2V7z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      Date & Time
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {event.date
                        ? new Date(event.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                        })
                        : "TBA"}
                      {event.time ? ` • ${event.time}` : ""}
                    </p>
                  </div>
                </div>
              )}

              {event.venue && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-lg bg-white/5 text-acid">
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M21 10c0 6-9 11-9 11s-9-5-9-11a9 9 0 1 1 18 0z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="10"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                      Location
                    </p>
                    <p className="text-sm font-semibold text-white line-clamp-1">
                      {event.venue}
                    </p>
                  </div>
                </div>
              )}

              {/* Other tags */}
              <div className="flex flex-wrap gap-2">
                {event.language && (
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-300">
                    {event.language}
                  </span>
                )}
                {event.ageLimit && (
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-gray-300">
                    {event.ageLimit}
                  </span>
                )}
              </div>
            </div>

            {/* Tabbed Content Section - Mobile */}
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden mb-8">
              {/* Tab Navigation */}
              <div className="flex border-b border-white/10 bg-black/20">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`flex-1 px-3 py-3 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === "description"
                      ? "text-acid border-b-2 border-acid bg-acid/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("timeline")}
                  className={`flex-1 px-3 py-3 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === "timeline"
                      ? "text-acid border-b-2 border-acid bg-acid/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setActiveTab("speakers")}
                  className={`flex-1 px-3 py-3 text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === "speakers"
                      ? "text-acid border-b-2 border-acid bg-acid/5"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  Speakers
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {/* Description Tab */}
                {activeTab === "description" && (
                  <div>
                    <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap">
                      {event.description || "No description available."}
                    </p>
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === "timeline" && (
                  <div>
                    {(serverEvent?.timeline &&
                      serverEvent.timeline.length > 0) ||
                      serverEvent?.registration_start ||
                      serverEvent?.registration_end ||
                      event.date ? (
                      <div className="space-y-4">
                        {serverEvent?.timeline &&
                          serverEvent.timeline.length > 0 ? (
                          serverEvent.timeline.map(
                            (stage: any, index: number) => (
                              <div
                                key={index}
                                className="flex gap-3 items-start"
                              >
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`w-2.5 h-2.5 rounded-full border ${stage.status === "completed"
                                        ? "bg-green-500 border-green-500/20"
                                        : stage.status === "active"
                                          ? "bg-acid border-acid/20 animate-pulse"
                                          : "bg-white/20 border-white/10"
                                      }`}
                                  />
                                  {index <
                                    (serverEvent.timeline?.length ?? 0) - 1 && (
                                      <div
                                        className={`w-0.5 h-full mt-1 ${stage.status === "completed"
                                            ? "bg-gradient-to-b from-green-500/50 to-transparent"
                                            : "bg-gradient-to-b from-acid/50 to-transparent"
                                          }`}
                                      />
                                    )}
                                </div>
                                <div className="flex-1 pb-3">
                                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                      {stage.title}
                                    </p>
                                    {stage.status === "completed" && (
                                      <span className="text-[9px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full font-bold">
                                        Done
                                      </span>
                                    )}
                                    {stage.status === "active" && (
                                      <span className="text-[9px] bg-acid/20 text-acid px-1.5 py-0.5 rounded-full font-bold">
                                        Live
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-white font-semibold text-sm mb-1.5">
                                    {stage.date ? (
                                      <>
                                        {new Date(stage.date).toLocaleDateString(
                                          "en-IN",
                                          {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                            ...(stage.time && {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            }),
                                          },
                                        )}
                                        {stage.time &&
                                          !stage.date.includes("T") &&
                                          ` · ${stage.time}`}
                                      </>
                                    ) : (
                                      stage.time && `${stage.time}`
                                    )}
                                  </p>
                                  {stage.description && (
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                      {stage.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ),
                          )
                        ) : (
                          <>
                            {serverEvent?.registration_start && (
                              <div className="flex gap-3 items-start">
                                <div className="flex flex-col items-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-acid border border-acid/20" />
                                  <div className="w-0.5 h-full bg-gradient-to-b from-acid/50 to-transparent mt-1" />
                                </div>
                                <div className="flex-1 pb-3">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                                    Registration Opens
                                  </p>
                                  <p className="text-white font-semibold text-sm">
                                    {new Date(
                                      serverEvent.registration_start,
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                            )}
                            {serverEvent?.registration_end && (
                              <div className="flex gap-3 items-start">
                                <div className="flex flex-col items-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-acid border border-acid/20" />
                                  <div className="w-0.5 h-full bg-gradient-to-b from-acid/50 to-transparent mt-1" />
                                </div>
                                <div className="flex-1 pb-3">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                                    Registration Closes
                                  </p>
                                  <p className="text-white font-semibold text-sm">
                                    {new Date(
                                      serverEvent.registration_end,
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                            )}
                            {event.date && (
                              <div className="flex gap-3 items-start">
                                <div className="flex flex-col items-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-acid border border-acid/20" />
                                  <div className="w-0.5 h-full bg-gradient-to-b from-acid/50 to-transparent mt-1" />
                                </div>
                                <div className="flex-1 pb-3">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                                    Event Date
                                  </p>
                                  <p className="text-white font-semibold text-sm">
                                    {new Date(event.date).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}
                                    {event.time && ` · ${event.time}`}
                                  </p>
                                </div>
                              </div>
                            )}
                            {serverEvent?.result_date && (
                              <div className="flex gap-3 items-start">
                                <div className="flex flex-col items-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 border border-green-500/20" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">
                                    Results Announced
                                  </p>
                                  <p className="text-white font-semibold text-sm">
                                    {new Date(
                                      serverEvent.result_date,
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-6 text-sm">
                        No timeline information available.
                      </p>
                    )}
                  </div>
                )}

                {/* Speakers & Guests Tab */}
                {activeTab === "speakers" && (
                  <div>
                    {event.performers || serverEvent?.performers ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-acid/10 border border-acid/20">
                            <span className="material-symbols-outlined text-acid text-lg">
                              person
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-white mb-1">
                              Performers
                            </h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              {event.performers || serverEvent?.performers}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-6 text-sm">
                        No speaker or guest information available.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Team Management Section */}
            {serverEvent &&
              serverEvent.is_team_event &&
              (serverEvent.event_type === "campus_event" ||
                serverEvent.event_type === "campus-event" ||
                serverEvent.event_type === "Campus Event") && (
                <section
                  className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8"
                  data-team-management
                >
                  <h2 className="text-lg font-bold text-white mb-4">
                    Team Management
                  </h2>
                  <TeamManagement
                    eventId={serverEvent.id || event.id}
                    isTeamEvent={serverEvent.is_team_event}
                    minTeamSize={serverEvent.min_team_size}
                    maxTeamSize={serverEvent.max_team_size}
                  />
                </section>
              )}

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-obsidian/90 backdrop-blur-xl border-t border-white/10 z-40">
              <div className="max-w-[420px] mx-auto w-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-gray-400">Total Price</div>
                  <div className="text-xl font-bold text-acid">₹{total}</div>
                </div>

                <div className="flex gap-3">
                  {!serverEvent?.is_team_event && serverEvent?.category !== "Hackathons" && serverEvent?.category !== "Hackathon" && (
                    <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="px-3 py-2 text-gray-400 hover:text-white"
                      >
                        -
                      </button>
                      <div className="px-2 font-mono text-white text-sm">
                        {qty}
                      </div>
                      <button
                        onClick={() => setQty((q) => q + 1)}
                        className="px-3 py-2 text-gray-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (
                        serverEvent?.is_team_event &&
                        (serverEvent.event_type === "campus_event" ||
                          serverEvent.event_type === "campus-event" ||
                          serverEvent.event_type === "Campus Event")
                      ) {
                        const teamSection = document.querySelector(
                          "[data-team-management]",
                        );
                        if (teamSection) {
                          teamSection.scrollIntoView({ behavior: "smooth" });
                          return;
                        }
                      }

                      if (serverEvent?.slug) {
                        router.push(
                          `/events/${serverEvent.slug}/book?qty=${qty}`,
                        );
                      } else if (event?.slug && !event.slug.includes("local")) {
                        router.push(`/events/${event.slug}/book?qty=${qty}`);
                      } else {
                        setShowModal(true);
                      }
                    }}
                    className="flex-1 bg-acid text-black py-3 rounded-xl font-bold text-sm uppercase tracking-wide shadow-neon-acid transition-all"
                  >
                    {serverEvent?.is_team_event
                      ? "Join / Create Team"
                      : "Book Now"}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal overlay */}
            {showModal && (
              <div className="fixed inset-0 z-50 flex items-end justify-center">
                <div
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  onClick={() => setShowModal(false)}
                />

                <div className="relative w-full max-w-[420px] bg-obsidian border-t border-white/10 rounded-t-2xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom duration-300">
                  <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="text-lg font-bold font-display text-white">
                      Confirm Booking
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">Subtotal</div>
                      <div className="font-medium text-white">
                        ₹{numericPrice}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">Quantity</div>
                      <div className="font-medium text-white">{qty}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">Taxes</div>
                      <div className="font-medium text-acid">FREE</div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-white/10 flex items-center justify-between">
                      <div className="text-base font-bold text-white">
                        Total
                      </div>
                      <div className="text-xl font-bold text-acid">
                        ₹{total}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-white/10 bg-black/20">
                    <button
                      onClick={() => handleConfirmBooking()}
                      className="w-full py-3.5 rounded-xl bg-acid text-black font-bold uppercase tracking-wide shadow-lg shadow-acid/20"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
