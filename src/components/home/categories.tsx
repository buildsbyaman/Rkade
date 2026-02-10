import React from "react";
import Image from "next/image";
import Link from "next/link";

type Category = {
  id: string;
  title: string;
  img?: string;
  href?: string;
};

type Props = {
  categories: Category[];
  title?: string;
  seeAllHref?: string;
  gridClass?: string;
  categoryType?: "movies" | "sports" | "campus_event" | "events";
};

export default function Categories({
  categories,
  title = "campuses",
  seeAllHref,
  gridClass = "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10",
  categoryType,
}: Props) {
  // Generate the appropriate events page URL based on category type
  const getEventsPageUrl = () => {
    if (seeAllHref) return seeAllHref; // Use custom href if provided

    switch (categoryType) {
      case "movies":
        return "/movie";
      case "sports":
        return "/sports";
      case "campus_event":
        return "/campus_event";
      case "events":
        return "/events";
      default:
        return "/all-campus"; // fallback
    }
  };

  return (
    <section aria-labelledby="categories" className="mb-8 md:mb-12">
      <div className="mb-4 md:mb-6 flex items-center gap-3">
        <h2 id="categories" className="text-base md:text-lg font-bold">
          {title}
        </h2>
        <Link href={getEventsPageUrl()}>
          <button
            className="text-sm md:text-base font-bold text-sky-600"
            aria-label={`See all ${title}`}
          >
            {"See all >"}
          </button>
        </Link>
      </div>

      <div className={`grid ${gridClass} gap-4 md:gap-6`}>
        {categories.map((category) => (
          <div key={category.id} className="text-center">
            <Link href={category.href || "#"} className="block">
              <div className="mx-auto h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 overflow-hidden border border-gray-100 bg-white mb-2">
                <Image
                  src={category.img || "/placeholder.svg"}
                  alt={category.title}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-xs md:text-sm font-bold text-zinc-700">
                {category.title}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
