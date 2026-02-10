"use client";

import React from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

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
  const [showSearchBar, setShowSearchBar] = React.useState(false);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    if (onSearch && query.trim()) {
      onSearch(query.trim());
    }
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
  };

  return (
    <header
      className={`fixed top-0 left-0 h-[76px] right-0 z-50 bg-white border-b border-zinc-200 ${className}`}
    >
      <div className="px-4 sm:px-6 md:px-8 h-full flex items-center">
        {/* Location and Logo */}
        <div className="flex items-center w-full relative">
          <div className="flex items-center gap-2">
            <LocationIcon />
            <div>
              <p className="text-sm font-bold text-zinc-900">
                {session?.user?.current_city || "City"}
              </p>
              <p className="text-xs text-zinc-500">
                {" "}
                Hello {session?.user?.name || "Guest"}
              </p>
            </div>
          </div>
          <span className="text-lg md:text-xl font-bold absolute left-1/2 transform -translate-x-1/2">
            {" "}
            <Image
              src="/favicon.ico"
              alt={logoText}
              width={28}
              height={28}
            />{" "}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {/* Search Container - Expandable */}
            <div className="relative flex items-center">
              <form
                role="search"
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showSearchBar ? "w-80 opacity-100" : "w-0 opacity-0"
                }`}
                onSubmit={handleSearchSubmit}
              >
                <div className="relative">
                  <input
                    type="search"
                    name="search"
                    placeholder="Search events, movies, sports..."
                    aria-label="Search"
                    className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-3 py-2 text-[15px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    autoFocus={showSearchBar}
                  />
                  <SearchInputIcon />
                </div>
              </form>

              <button
                onClick={toggleSearchBar}
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  showSearchBar ? "ml-2 bg-black" : "bg-black hover:bg-gray-800"
                }`}
                aria-label="Toggle search"
              >
                <SearchToggleIconWhite />
              </button>
            </div>

            <button onClick={() => (window.location.href = "/events/create")}>
              <img
                src="/newevent.svg"
                alt="New event"
                className="inline w-[126px] h-[32px] mr-2 -mt-1"
              />
            </button>

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
      </div>
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

function SearchInputIcon() {
  return (
    <svg
      aria-hidden="true"
      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L17 17" />
    </svg>
  );
}

function SearchToggleIconWhite() {
  return (
    <svg
      className="h-5 w-5 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}
