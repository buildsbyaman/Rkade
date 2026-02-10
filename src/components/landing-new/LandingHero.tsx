"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getFeaturedEventsClient, getEventsClient } from "@/lib/events-client";
import BookingsSquare from "@/components/home/bookings-square";
import FlagshipEventsBanner from "@/components/home/flagship-events-banner";

const TAGS = [
  "#Gaming",
  "#Music",
  "#Tech",
  "#Sports",
  "#Hackathons",
  "#Workshops",
  "#Startups",
  "#Mumbai",
  "#Delhi",
  "#Bangalore",
  "#Hyderabad",
];

export function LandingHero() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [bookingCount, setBookingCount] = useState(0);
  const [currentPoster, setCurrentPoster] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [posters, setPosters] = useState<
    { src: string; title: string; id: string; slug?: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/bookings/user")
        .then((res) => {
          if (res.ok) return res.json();
          return [];
        })
        .then((data) => {
          if (Array.isArray(data)) setBookingCount(data.length);
        })
        .catch((err) => console.error("Failed to fetch bookings count", err));
    }
  }, [status]);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        // Fetch all events for random display
        const events = await getEventsClient();
        console.log("Hero: Fetched events:", events?.length);
        
        if (events && events.length > 0) {
          // Shuffle events randomly
          const shuffled = [...events].sort(() => 0.5 - Math.random()).slice(0, 15);
          
          const mappedPosters = shuffled.map((e: any) => ({
            src:
              e.portrait_poster ||
              e.portraitPoster ||
              e.landscape_poster ||
              e.landscapePoster ||
              "/Assests/1.jpg",
            title: e.event_name || e.eventName || "Event",
            id: e.id,
            slug: e.slug,
          }));
          setPosters(mappedPosters);
        } else {
          // Fallback to placeholder if no events
          setPosters([
            {
              src: "/Assests/1.jpg",
              title: "Welcome to Rkade",
              id: "default",
            },
            {
                src: "/Assests/1.jpg",
                title: "Discover Events",
                id: "default-2",
            },
            {
                src: "/Assests/1.jpg",
                title: "Join the Community",
                id: "default-3",
            }
          ]);
        }
      } catch (error) {
        console.error("Failed to load hero posters", error);
        setPosters([
          { src: "/Assests/1.jpg", title: "Welcome to Rkade", id: "default" },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const isPaused = useRef(false);

  // Handle Mobile Scroll Highlighting
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    if (posters.length === 0) return;

    // effective card width including gap (75% + 16px)
    const cardWidth = container.clientWidth * 0.75 + 16; 
    const scrollPosition = container.scrollLeft;
    
    // Calculate current centered index
    const index = Math.round(scrollPosition / cardWidth);
    setCarouselIndex(index % posters.length);
  };

  useEffect(() => {
    // Only Desktop Hero Timer
    if (posters.length === 0) return;

    const timer = setInterval(() => {
      setCurrentPoster((prev) => (prev + 1) % posters.length);
    }, 7000);

    // Mobile Auto-Scroll Timer (5s)
    const mobileTimer = setInterval(() => {
        if (isPaused.current) return;
        const container = document.getElementById("mobile-trending-carousel");
        if (!container) return;
        
        const cardWidth = container.clientWidth * 0.75 + 16;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (container.scrollLeft >= maxScroll - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: cardWidth, behavior: 'smooth' });
        }
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(mobileTimer);
    };
  }, [posters.length]);

  // Removed Mobile Auto-Scroll useEffects to allow smooth manual scrolling

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleSearch = () => {
    const queryParts = [];
    if (searchQuery.trim()) queryParts.push(searchQuery.trim());
    if (selectedTags.length > 0) {
      // Remove # and add to query
      queryParts.push(...selectedTags.map((t) => t.replace("#", "")));
    }

    const params = new URLSearchParams();
    if (queryParts.length > 0) {
      params.set("search", queryParts.join(" "));
    }

    router.push(`/events?${params.toString()}`);
  };

  const currentPosterData =
    posters.length > 0
      ? posters[currentPoster]
      : { src: "", title: "", id: "", slug: "" };

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 pt-6 pb-2 sm:px-6 lg:px-8">
      {/* ... Desktop Content ... */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-12 grid-rows-auto md:grid-rows-[auto_300px] gap-6">
        <div className="md:col-span-8 flex flex-col justify-end">
          <div className="inline-flex w-fit items-center rounded-full border border-acid/30 bg-acid/10 px-3 py-1 sm:px-4 sm:py-1.5 backdrop-blur-md mb-4 sm:mb-6">
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-acid mr-2 sm:mr-3 shadow-neon-acid animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-bold text-acid uppercase tracking-widest">
              Live Campus Feed
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-7xl md:text-8xl font-bold uppercase tracking-tighter text-white mb-4 sm:mb-6 flex flex-col gap-0 sm:gap-2 leading-[0.9]">
            <span>Stop</span>
            <span className="text-outline-acid">Scrolling.</span>
            <span>
              Start <span className="text-acid">Living.</span>
            </span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg max-w-xl font-medium mb-6 sm:mb-8 border-l-2 border-acid pl-4 sm:pl-6 leading-relaxed">
            Your campus is an arena. Don&apos;t be an NPC in your own university
            life. Join the server.
          </p>
        </div>

        <div
          className="md:col-span-4 h-full rounded-3xl relative overflow-hidden group shadow-matte bg-black/20 backdrop-blur-md cursor-pointer"
          onClick={() => {
            if (currentPosterData.slug) {
              router.push(`/events/${currentPosterData.slug}`);
            }
          }}
        >
          <div className="absolute inset-0 z-0 transition-all duration-500 grayscale group-hover:grayscale-0">
            <AnimatePresence mode="wait">
              {posters.length > 0 && (
                <motion.img
                  key={currentPosterData.id || currentPoster}
                  src={currentPosterData.src}
                  alt={currentPosterData.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="h-full w-full object-cover"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Overlay Gradient (Always visible to ensure text readability if needed, but we rely on hover for title) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 z-10"></div>

          {/* Content that appears on Hover */}
          <div className="absolute bottom-0 left-0 w-full p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
            <div className="inline-block px-3 py-1 bg-acid text-black text-xs font-bold uppercase rounded-sm mb-2">
              Featured Event
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white uppercase">
              {currentPosterData.title}
            </h3>
          </div>

          {/* Timer Progress Bar (Optional Visual Cue for rotation) */}
          <div className="absolute bottom-0 left-0 h-1 bg-acid z-30 animate-[progress_7s_linear_infinite] origin-left"></div>
        </div>

        {/* Row 2: Bookings Square (spans 5 cols) and Flagship Events Banner (spans 7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-4"
        >
          <BookingsSquare />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="hidden md:block md:col-span-8 -mt-[50px]"
        >
          <div className="flex flex-col h-full justify-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white uppercase mb-2">
              Find Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-acid to-white">
                Events
              </span>
            </h3>
            <p className="text-gray-400 mb-8 max-w-sm">
              Connect with 500+ active clubs. From E-sports to Hackathons.
            </p>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-acid/40 via-electric-purple/30 to-acid/40 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
              <div className="relative flex items-center bg-black/40 rounded-xl p-2 border border-white/10">
                <span className="material-symbols-outlined text-gray-500 ml-3">
                  search
                </span>
                <input
                  className="bg-transparent border-none text-white w-full focus:ring-0 placeholder-gray-600 px-3 outline-none"
                  placeholder="Search for clubs, events, or people..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="bg-white text-obsidian px-6 py-2 rounded-lg font-bold uppercase text-sm hover:bg-acid transition-colors"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile-Specific Layout */}
      <div className="flex flex-col md:hidden">
        {/* Live Feed Badge - Hidden on Mobile */}
        <div className="hidden justify-center pt-2 pb-6">
          <div className="inline-flex items-center rounded-full border border-acid/30 bg-acid/10 px-4 py-2 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-acid mr-2 shadow-neon-acid animate-pulse"></span>
            <span className="text-xs font-bold text-acid uppercase tracking-widest">
              Live Campus Feed
            </span>
          </div>
        </div>

        {/* Hero Text - Hidden on Mobile */}
        <div className="hidden text-left px-4 pb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white uppercase flex flex-col gap-1">
            <span>Stop</span>
            <span className="text-outline-acid">Scrolling.</span>
            <span>
              Start <span className="text-acid">Living.</span>
            </span>
          </h1>
          <p className="text-gray-400 text-sm mt-5 max-w-sm font-medium border-l-2 border-acid pl-4 leading-relaxed">
            Your campus is an arena. Don&apos;t be an NPC in your own university
            life. Join the server.
          </p>
        </div>



        {/* Search Bar - Hidden on Mobile */}
        <div className="hidden relative group px-4 pb-8">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-acid/40 via-electric-purple/30 to-acid/40 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-700"></div>
          <div className="relative flex items-center bg-black/40 rounded-xl p-2 border border-white/10">
            <span className="material-symbols-outlined text-gray-500 ml-3">
              search
            </span>
            <input
              className="bg-transparent border-none text-white w-full focus:ring-0 placeholder-gray-600 px-3 outline-none text-sm"
              placeholder="Search events..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="bg-white text-obsidian px-5 py-2 rounded-lg font-bold uppercase text-xs hover:bg-acid transition-colors"
            >
              Go
            </button>
          </div>
        </div>

        {/* Featured Event Poster - Hidden on Mobile, replaced with horizontal trending */}
        <div
          className="hidden relative aspect-[3/4] mx-4 mb-8 rounded-3xl overflow-hidden shadow-matte bg-black/20 backdrop-blur-md border border-white/10 cursor-pointer"
          onClick={() => {
            if (currentPosterData.slug) {
              router.push(`/events/${currentPosterData.slug}`);
            }
          }}
        >
          <div className="absolute inset-0 transition-all duration-500">
            {posters.length > 0 && (
              <img
                src={currentPosterData.src}
                alt={currentPosterData.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

          {/* Poster Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="inline-block px-3 py-1 bg-acid text-black text-xs font-bold uppercase rounded-sm mb-2">
              Featured Event
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white uppercase">
              {currentPosterData.title}
            </h3>
          </div>

          {/* Progress Indicators */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {posters.slice(0, 5).map((_, index) => (
              <div
                key={index}
                className={`h-8 w-1 rounded-full transition-all duration-300 ${index === currentPoster ? "bg-acid" : "bg-white/30"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Horizontal Auto-Scrolling Trending Events - Mobile Only */}
        <div className="mb-0 overflow-visible">
          <div className="relative px-4">
            <div
              id="mobile-trending-carousel"
              onScroll={handleScroll}
              onTouchStart={() => { isPaused.current = true; }}
              onTouchEnd={() => { setTimeout(() => isPaused.current = false, 2000); }}
              onMouseEnter={() => { isPaused.current = true; }}
              onMouseLeave={() => { isPaused.current = false; }}
              className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth py-12"
              style={{ scrollBehavior: "smooth" }}
            >
              {[...posters, ...posters, ...posters].map((poster, index) => {
                const actualIndex = index % posters.length;
                const isCenter = actualIndex === carouselIndex;
                return (
                  <div
                    key={`${poster.id || actualIndex}-${index}`}
                    className={`flex-shrink-0 w-[75%] snap-center transition-all duration-500 ${isCenter ? "scale-105" : "scale-95 opacity-60"}`}
                    onClick={() => {
                      if (poster.slug) {
                        router.push(`/events/${poster.slug}`);
                      }
                    }}
                  >
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg bg-black/20 backdrop-blur-md border border-white/10 cursor-pointer group">
                      <img
                        src={poster.src}
                        alt={poster.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                      {/* Event Title */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-base md:text-lg font-bold text-white uppercase line-clamp-2">
                          {poster.title}
                        </h4>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tags - Hidden on Mobile */}
        <div className="hidden gap-2 flex-wrap px-4 pb-8">
          {TAGS.slice(0, 6).map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1.5 rounded-full border text-xs font-mono transition-colors ${selectedTags.includes(tag)
                  ? "border-acid bg-acid text-black font-bold"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/30"
                }`}
            >
              {tag.replace("#", "")}
            </button>
          ))}
        </div>

        {/* Bookings Card */}
        {status === "authenticated" && (
          <div className="px-4 pb-2">
            <BookingsSquare />
          </div>
        )}
      </div>

      {/* Overlay Navigation Pill - Mobile Only */}
      <div className="fixed bottom-6 right-4 left-4 flex justify-center z-50 lg:hidden">
        <div className="flex gap-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-3 py-2.5 shadow-xl">
          <button
            onClick={() => router.push("/fests")}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full hover:bg-acid/10 transition-all active:scale-95"
            title="Fests"
          >
            <span className="material-symbols-outlined text-lg text-acid">
              local_activity
            </span>
          </button>
          <button
            onClick={() => router.push("/campuses")}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full hover:bg-electric-purple/10 transition-all active:scale-95"
            title="Campus"
          >
            <span className="material-symbols-outlined text-lg text-electric-purple">
              school
            </span>
          </button>
          <button
            onClick={() => router.push("/hackathons")}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full hover:bg-acid/10 transition-all active:scale-95"
            title="Hacks"
          >
            <span className="material-symbols-outlined text-lg text-acid">
              code
            </span>
          </button>
          <button
            onClick={() => router.push("/cohorts")}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full hover:bg-electric-purple/10 transition-all active:scale-95"
            title="Cohorts"
          >
            <span className="material-symbols-outlined text-lg text-electric-purple">
              groups
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
