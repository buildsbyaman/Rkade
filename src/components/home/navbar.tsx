"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  onSearch?: (query: string) => void;
  logoText?: string;
  className?: string;
}

export default function Navbar({
  onSearch,
  logoText = "Logo",
  className = "",
}: NavbarProps) {
  const { data: session } = useSession();
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState(
    session?.user?.current_city || "City",
  );

  // List of cities
  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Chandigarh",
    "Lucknow",
    "Kochi",
    "Indore",
    "Nagpur",
    "Bhopal",
  ];

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
    // TODO: Update user's city in database/session
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <header className={`px-4 sm:px-6 md:px-8 pt-4 pb-2 ${className}`}>
      {/* Location and Logo */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="relative">
          <Image src="/Asset4.svg" alt="Location" width={48} height={24} />

          {/* City Dropdown */}
          {showCityDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowCityDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-80 overflow-y-auto">
                <div className="p-2">
                  <input
                    type="text"
                    placeholder="Search city..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="py-1">
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        selectedCity === city
                          ? "bg-sky-50 text-sky-700 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-32 sm:gap-16 md:gap-24 lg:gap-36">
          <Link href="/home" className="flex items-center">
            <span className="text-lg md:text-xl font-bold">
              <Image src="/favicon.ico" alt="Logo" width={25} height={25} />
            </span>
          </Link>
          <div
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-zinc-400 transition-colors"
            onClick={() => (window.location.href = "/profile")}
            role="button"
            tabIndex={0}
            aria-label="Go to profile"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                window.location.href = "/profile";
              }
            }}
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User profile"}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon />
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <form
        role="search"
        className="relative mb-4 md:mb-6"
        onSubmit={handleSearchSubmit}
      >
        <input
          type="search"
          name="search"
          placeholder="Search"
          aria-label="Search"
          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 md:pl-12 pr-3 py-2 md:py-3 text-[15px] md:text-base placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
        <svg
          aria-hidden="true"
          className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-zinc-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20L17 17" />
        </svg>
      </form>
    </header>
  );
}

// Icon Components
function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4 text-zinc-600"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}
