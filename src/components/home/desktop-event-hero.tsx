import React, { useEffect, useState, useRef } from "react"
import Image from "next/image";

type EventDetails = {
  id: string;
  title: string;
  category: string;
  time: string;
  date: string;
  venue: string;
  language: string;
  ageRating: string;
  posterImage: string;

}

type Props = {
  events: EventDetails[];
  showArtistNearYou?: boolean;
}

export default function DesktopEventHero({ events }: Props) {
  const [index, setIndex] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)

  // Auto-advance every 5 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % events.length)
    }, 5000)
    return () => clearInterval(id)
  }, [events.length])

  // Animate translateX when index changes
  useEffect(() => {
    const el = sliderRef.current
    if (!el) return
    el.style.transition = "transform 500ms ease-in-out"
    el.style.transform = `translateX(-${index * 100}%)`
  }, [index])

  const goToSlide = (slideIndex: number) => {
    setIndex(slideIndex)
  }

  const goToPrevious = () => {
    setIndex((prev) => (prev - 1 + events.length) % events.length)
  }

  const goToNext = () => {
    setIndex((prev) => (prev + 1) % events.length)
  }

  // Touch/Mouse handlers for sliding
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
    const el = sliderRef.current
    if (el) el.style.transition = "none"
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const currentX = e.touches[0].clientX
    touchDeltaX.current = currentX - touchStartX.current
    const el = sliderRef.current
    if (!el) return
    const width = el.clientWidth / events.length
    const base = -index * width
    el.style.transform = `translateX(${base + touchDeltaX.current}px)`
  }

  const onTouchEnd = () => {
    const threshold = 50 // px to decide swipe
    if (touchDeltaX.current > threshold) {
      setIndex((prev) => (prev - 1 + events.length) % events.length)
    } else if (touchDeltaX.current < -threshold) {
      setIndex((prev) => (prev + 1) % events.length)
    } else {
      // snap back
      const el = sliderRef.current
      if (el) {
        el.style.transition = "transform 300ms ease"
        el.style.transform = `translateX(-${index * 100}%)`
      }
    }
    touchStartX.current = null
    touchDeltaX.current = 0
  }

  // Mouse handlers for desktop dragging
  const onMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX
    touchDeltaX.current = 0
    const el = sliderRef.current
    if (el) el.style.transition = "none"
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (touchStartX.current == null) return
    const currentX = e.clientX
    touchDeltaX.current = currentX - touchStartX.current
    const el = sliderRef.current
    if (!el) return
    const width = el.clientWidth / events.length
    const base = -index * width
    el.style.transform = `translateX(${base + touchDeltaX.current}px)`
  }

  const onMouseUp = () => {
    const threshold = 50 // px to decide swipe
    if (touchDeltaX.current > threshold) {
      setIndex((prev) => (prev - 1 + events.length) % events.length)
    } else if (touchDeltaX.current < -threshold) {
      setIndex((prev) => (prev + 1) % events.length)
    } else {
      // snap back
      const el = sliderRef.current
      if (el) {
        el.style.transition = "transform 300ms ease"
        el.style.transform = `translateX(-${index * 100}%)`
      }
    }
    touchStartX.current = null
    touchDeltaX.current = 0
  }
  return (
    <section className="mb-1">
      <div 
        className="relative w-full overflow-hidden  bg-gray-900 shadow-lg cursor-grab active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div
          ref={sliderRef}
          className="flex"
          style={{ width: `${events.length * 100}%` }}
        >
          {events.map((event, idx) => {
            // Sanitize poster image to ensure it's a valid string
            const sanitizedPosterImage = (() => {
              if (typeof event.posterImage === 'string' && event.posterImage.trim()) {
                return event.posterImage;
              }
              return "karan.svg"; // fallback
            })();

            return (
            <div key={event.id} className="w-full shrink-0">
              <div className="relative w-full min-h-[600px]">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={sanitizedPosterImage}
                    alt="Event background"
                    width={100}
                    height={400}
                    className="h-full w-[1800px] object-cover"
                    priority={idx === 0}
                  />
                  <div
  className="absolute inset-0 w-full h-full z-0 bg-[linear-gradient(rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.5)_0%,rgb(255,255,255)_60%)] backdrop-blur-lg"
  aria-hidden="true"
/>

                </div>

                {/* Event Content */}
                <div className="relative z-10 flex items-center py-[96px] px-[164px] min-h-[400px] gap-[50px]">
                  {/* Event Poster */}
                  <div className="flex-shrink-0"> 
                    <div className="w-64 h-80 rounded-[8px] overflow-hidden shadow-2xl w-[270px] h-[346px]">
                      <Image
                        src={sanitizedPosterImage || "/brand1.svg"}
                        alt={event.title}
                        width={270}
                        height={346}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 ml-24 text-white">
                    {/* Category Badge */}
                    <div className="inline-block mb-[22px]">
                      <span className="bg-gray-900 text-white px-[14px] py-[10px] rounded-[8px] text-[14px] font-medium tracking-wide">
                        {event.category}
                      </span>
                    </div>

                    {/* Event Title */}
                    <h1 className="text-[45px] font-semibold mb-[18px] leading-tight text-black">
                      {event.title}
                    </h1>

                    {/* Event Info - Complete */}
                    <div className="flex flex-col gap-[13px] mb-[36px]  text-black">
                      <div className="flex items-center space-x-[20px]">
                        <CalendarIcon />
                        <span className="text-[20px]">{event.date}</span>
                      </div>
                      
                      <div className="flex items-center space-x-[20px]">
                        <TimeIcon />
                        <span className="text-[20px]">{event.time}</span>
                      </div>
                      
                      <div className="flex items-center space-x-[20px]">
                        <LocationIcon />
                        <span className="text-[20px]">{event.venue}</span>
                      </div>
                      
                      <div className="flex items-center space-x-[20px]">
                        <LanguageIcon />
                        <span className="text-[20px]">{event.language}</span>
                      </div>
                      
                      <div className="flex items-center space-x-[20px]">
                        <AgeIcon />
                        <span className="text-[20px]">{event.ageRating}</span>
                      </div>
                    </div>

                    {/* Book Seats Button */}
                    <button className="bg-black hover:bg-gray-800 text-white px-[128px] py-3 rounded-lg font-semibold text-lg transition-colors duration-200 shadow-lg">
                      Book Seats
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black backdrop-blur-sm hover:bg-gray-800 rounded-full flex items-center justify-center text-white transition-all duration-200"
          aria-label="Previous slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black backdrop-blur-sm hover:bg-gray-800 rounded-full flex items-center justify-center text-white transition-all duration-200"
          aria-label="Next slide"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {events.map((event, i) => (
            <button
              key={event.id}
              onClick={() => goToSlide(i)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                i === index 
                  ? "bg-white shadow-lg" 
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Icons
function TimeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function LanguageIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M5 8l6 6" />
      <path d="M4 14l6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="M22 22l-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  )
}

function AgeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}