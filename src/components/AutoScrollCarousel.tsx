"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

interface Speaker {
  image: string;
  name: string;
  title: string;
  company: string;
}

interface AutoScrollCarouselProps {
  speakers: Speaker[];
  title?: string;
}

export function AutoScrollCarousel({ speakers, title = "Featured Speakers" }: AutoScrollCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame - very slow
    const itemWidth = 400; // approximate width of each item

    const scroll = () => {
      scrollPosition += scrollSpeed;
      
      // Reset scroll position when reaching the end of first set
      if (scrollPosition >= itemWidth * speakers.length) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
    };

    const intervalId = setInterval(scroll, 50); // slower interval

    // Pause on hover
    const handleMouseEnter = () => clearInterval(intervalId);
    const handleMouseLeave = () => {
      const newIntervalId = setInterval(scroll, 45);
      return () => clearInterval(newIntervalId);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearInterval(intervalId);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [speakers.length]);

  // Duplicate speakers for seamless loop
  const duplicatedSpeakers = [...speakers, ...speakers];

  return (
    <div className="hidden md:block w-full overflow-hidden py-8 px-4 md:px-0">
      <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-wider">
        {title}
      </h2>
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-hidden scrollbar-hide"
        style={{ scrollBehavior: "auto" }}
      >
        {duplicatedSpeakers.map((speaker, index) => (
          <div
            key={`${speaker.name}-${index}`}
            className="flex-shrink-0 w-[400px] bg-white/5 rounded-2xl overflow-hidden border border-white/10 group hover:border-acid/50 transition-all duration-300"
          >
            <div className="relative h-[300px] overflow-hidden">
              <Image
                src={speaker.image}
                alt={speaker.name}
                fill
                className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                sizes="400px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-acid transition-colors">
                {speaker.name}
              </h3>
              <p className="text-acid text-sm font-semibold mb-1">
                {speaker.title}
              </p>
              <p className="text-gray-400 text-sm">
                {speaker.company}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
