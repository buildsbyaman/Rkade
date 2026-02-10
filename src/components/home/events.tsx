import React from "react";
import { EventCard } from "@/components/EventCard";

type Event = {
  id: string;
  category: string;
  name: string;
  price?: string;
  img?: string;
  href?: string;
  slug?: string;
  venue?: string;
  campusSlug?: string;
  date?: string | Date;
  description?: string;
};

type Props = {
  events: Event[];
  title?: string;
  seeAllHref?: string;
  gridClass?: string; // optional tailwind classes to customize grid columns
};

export default function EventGrid({
  events,
  title = "All Events",
  seeAllHref = "/events/${events.id}",
  gridClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
}: Props) {
  return (
    <section aria-labelledby="all-events" className="mb-8 md:mb-12">
      <div className="mb-4 md:mb-6 flex items-center gap-3">
        <h2 id="all-events" className="text-base md:text-lg font-bold">
          {title}
        </h2>
      </div>

      <div className={`grid ${gridClass}`}>
        {events.map((event, index) => (
          <EventCard
            key={event.id}
            title={event.name}
            slug={event.slug || event.id}
            image={event.img || "/Assests/1.jpg"}
            date={event.date}
            category={event.category}
            location={event.venue}
            campus={event.campusSlug}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
