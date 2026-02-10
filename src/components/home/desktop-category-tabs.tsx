"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

type CategoryTab = {
  id: string;
  label: string;
  href: string;
  isActive?: boolean;
};

type Props = {
  categories: CategoryTab[];
  onCategoryChange?: (categoryId: string) => void;
};

export default function DesktopCategoryTabs({
  categories,
  onCategoryChange,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabClick = (category: CategoryTab) => {
    router.push(category.href);
    onCategoryChange?.(category.id);
  };

  return (
    <section className="bg-gray-200 w-full  shadow-sm border border-gray-200 ">
      <div className="flex items-center justify-center">
        <nav className="flex space-x-1 ">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleTabClick(category)}
              className={`px-6 py-3 rounded-md hover:cursor-pointer hover:text-black text-sm transition-all duration-200 ${
                pathname === category.href
                  ? "text-gray-900 font-bold"
                  : "text-gray-600 "
              }`}
            >
              {category.label}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}