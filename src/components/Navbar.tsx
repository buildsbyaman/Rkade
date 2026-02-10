"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { canAccessStaffRoutes } from "@/lib/staff-auth";

const navLinks = [
  { name: "All Events", href: "/events" },
  { name: "Campuses", href: "/campuses" },
  { name: "Fests", href: "/fests" },
  { name: "Hackathons", href: "/hackathons" },
  { name: "Cohorts", href: "/cohorts" },
  { name: "Meetups", href: "/meetups" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/events?search=${encodeURIComponent(searchQuery)}`;
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-glass-border bg-obsidian/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="group relative flex size-10 items-center justify-center rounded-xl text-black transition-all overflow-hidden"
          >
            <img
              src="/favicon.ico"
              alt="Rkade"
              className="w-6 h-6 group-hover:rotate-12 transition-transform"
            />
          </Link>
          <Link
            href="/"
            className="text-2xl font-display font-bold tracking-tight text-white uppercase italic"
          >
            Rkade<span className="text-acid">.</span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                pathname.startsWith(link.href)
                  ? "text-acid"
                  : "text-gray-400 hover:text-acid"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Mobile Search Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex md:hidden items-center justify-center size-10 rounded-lg text-white hover:bg-white/10"
          >
            <span className="material-symbols-outlined text-xl">
              {isSearchOpen ? "close" : "search"}
            </span>
          </button>

          {/* Auth / Profile Section */}
          {status === "loading" ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
          ) : status === "authenticated" ? (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative flex items-center justify-center rounded-full transition-transform hover:scale-105"
              >
                <div className="relative size-10 overflow-hidden rounded-full border-2 border-white/10 bg-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      session.user?.image ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user?.email}`
                    }
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>

              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-lg border border-white/10 bg-obsidian py-1 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="text-sm font-medium text-white">
                        {session.user?.name || "User"}
                      </p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {session.user?.role && canAccessStaffRoutes(session.user.role) && (
                      <Link
                        href="/staff/dashboard"
                        className="block px-4 py-2 text-sm text-[#ccff00] hover:bg-white/5 hover:text-white cursor-pointer font-semibold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        ⚡ Staff Portal
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        signOut({ callbackUrl: "/auth/signin" });
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="hidden sm:flex items-center justify-center text-sm font-bold uppercase tracking-wide text-white hover:text-acid transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="hidden sm:flex relative overflow-hidden rounded-lg bg-acid px-6 py-2.5 text-sm font-black uppercase tracking-wide text-black transition-all hover:bg-white hover:shadow-neon-acid"
              >
                <span className="relative z-10">Sign Up</span>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center size-10 rounded-lg text-white hover:bg-white/10"
            >
              <span className="material-symbols-outlined text-2xl">
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="md:hidden border-t border-white/10 bg-obsidian/95 backdrop-blur-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search events..."
                className="w-full h-12 px-4 pr-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-acid/50 focus:ring-1 focus:ring-acid/50 transition-all"
                autoFocus
              />
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none">
                search
              </span>
            </div>
            <button
              onClick={handleSearch}
              className="h-12 px-6 rounded-lg bg-acid text-black font-bold uppercase tracking-wide hover:bg-white transition-colors"
            >
              Go
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 top-20 z-[200] border-t border-white/10 animate-in fade-in slide-in-from-top-5 duration-200"
          style={{ backgroundColor: "#0e1111" }}
        >
          <nav
            className="flex flex-col p-6 gap-2"
            style={{ backgroundColor: "#0e1111" }}
          >
            {status !== "authenticated" && (
              <div className="flex flex-col gap-3 mb-6 pb-6 border-b border-white/10">
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center h-12 rounded-lg border border-white/10 bg-white/5 text-sm font-bold uppercase tracking-wide text-white active:bg-white/10 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center h-12 rounded-lg bg-acid text-sm font-black uppercase tracking-wide text-black active:bg-white transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center h-14 px-4 rounded-xl text-lg font-bold uppercase tracking-widest transition-all ${
                  pathname.startsWith(link.href)
                    ? "bg-acid/10 text-acid border border-acid/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
