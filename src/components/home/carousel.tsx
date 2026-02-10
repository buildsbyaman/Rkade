"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
import { useState, useRef } from "react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  img?: string;
  alt?: string;
  link?: string;
  price?: string;
}

interface Event {
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
  slug?: string;
}

interface BannerCarouselProps {
  banners?: Banner[];
  events?: Event[];
}

export default function BannerCarousel({
  banners,
  events,
}: BannerCarouselProps) {
  // Transform events to banner format if events are provided
  const transformedBanners = events
    ? events.slice(0, 5).map((event) => ({
      id: event.id,
      title: event.name,
      subtitle: event.category,
      img: event.img,
      alt: event.name,
      link: event.href || `/events/${event.slug || event.id}`,
      price:
        event.price === "0" || event.price?.toLowerCase() === "free"
          ? "FREE"
          : event.price,
    }))
    : [];

  // Use events-based banners if available, otherwise use provided banners
  const displayBanners =
    events && events.length > 0 ? transformedBanners : banners || [];


  // Track active slide index
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<any>(null);

  // Helper to get the correct slide index for highlighting (handles loop mode)
  const getDisplayIndex = (swiperIndex: number) => {
    if (!swiperRef.current) return swiperIndex;
    const swiper = swiperRef.current;
    // Swiper adds duplicated slides at the start/end in loop mode
    if (swiper.params.loop && swiper.slides && swiper.slides.length > displayBanners.length) {
      // Swiper's realIndex is the index in the original slides array
      return swiper.realIndex;
    }
    return swiperIndex;
  };

  if (displayBanners.length === 0) {
    return null; // Don't render if no banners or events
  }

  return (
    <div className="w-full relative">
      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        spaceBetween={20}
        loop={displayBanners.length > 1}
        speed={800}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        coverflowEffect={{
          rotate: 15,
          stretch: 0,
          depth: 300,
          modifier: 1.2,
          slideShadows: true,
          scale: 0.9,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        breakpoints={{
          320: {
            spaceBetween: 15,
            coverflowEffect: {
              rotate: 10,
              depth: 200,
              modifier: 1,
            },
          },
          640: {
            spaceBetween: 20,
            coverflowEffect: {
              rotate: 15,
              depth: 300,
              modifier: 1.2,
            },
          },
        }}
        modules={[EffectCoverflow, Autoplay, Pagination]}
        className="mySwiper pb-12"
        style={{
          "--swiper-pagination-color": "#3B82F6",
          "--swiper-pagination-bullet-inactive-color": "#CBD5E1",
          "--swiper-pagination-bullet-size": "8px",
          "--swiper-pagination-bullet-horizontal-gap": "4px",
        } as React.CSSProperties}
        onSlideChangeTransitionEnd={(swiper) => setActiveIndex(getDisplayIndex(swiper.activeIndex))}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
      >
        {displayBanners.map((banner, index) => (
          <SwiperSlide key={index} style={{ width: "270px" }}>
            <a
              href={banner.link ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`block transform transition-all duration-300 hover:scale-105 ${activeIndex === index ? "ring-4 ring-acid/80 z-10" : ""
                }`}
            >
              <div className="rounded-xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl">
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={banner.img}
                    alt={banner.alt ?? `banner-${index}`}
                    className="w-full h-[380px] object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
                </div>
              </div>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

// Export as both default and named export to match import patterns
export { BannerCarousel as Carousel };

// Filter functionality
export function useFilters() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  };

  return { activeFilters, toggleFilter };
}

// FilterButtons component
interface FilterButtonsProps {
  filters: string[];
  activeFilters: string[];
  onToggleFilter: (filter: string) => void;
  className?: string;
}

export function FilterButtons({
  filters,
  activeFilters,
  onToggleFilter,
  className = "",
}: FilterButtonsProps) {
  return (
    <div className={`flex flex-wrap gap-2 mb-6 ${className}`}>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onToggleFilter(filter)}
          className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${activeFilters.includes(filter)
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-700 hover:bg-gray-300 border-gray-300"
            }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}
