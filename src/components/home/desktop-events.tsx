import React from "react";
import Image from "next/image";
import Link from "next/link";

type Event = {
  id: string;
  category: string;
  name: string;
  price: string;
  img: string;
  href?: string;
};

type Props = {
  events: Event[];
  title?: string;
  seeAllHref?: string;
};

export default function DesktopEventGrid({
  events,
  title = "Events",
  seeAllHref = "/events",
}: Props) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Link href={seeAllHref}>
          <button className="text-sky-600 hover:text-sky-700 font-semibold flex items-center space-x-1 transition-colors">
            <span>View All</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {events.map((event) => (
          <Link
            key={event.id}
            href={event.href || "/campus-events/{event.id}"}
            className="group"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group-hover:border-sky-200">
              <div className="aspect-[3/2] relative overflow-hidden bg-gray-100">
                <Image
                  src={event.img || "/placeholder.svg"}
                  alt={event.name}
                  width={1500}
                  height={597}
                  className="w-[183px] h-[535px] object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="p-4">
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium text-sky-600 bg-sky-50 rounded-full">
                    {event.category}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors line-clamp-2">
                  {event.name}
                </h3>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {event.price}
                  </span>
                  <button className="text-sky-600 hover:text-sky-700 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-200">
                    Books Now →
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
