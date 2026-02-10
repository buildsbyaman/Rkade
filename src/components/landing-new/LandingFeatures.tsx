"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function LandingFeatures() {
  return (
    <section className="hidden md:block pt-16 pb-16 md:pt-32 md:pb-32 border-t border-white/5">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white uppercase">
            Everything you need
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto px-2">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center py-6 px-4 md:py-8 md:px-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-sm hover:border-acid/40 transition-all">
            <div className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl bg-acid/10 text-acid mb-3 md:mb-4">
              <span className="material-symbols-outlined text-3xl">
                account_balance
              </span>
            </div>
            <h3 className="text-[11px] md:text-lg font-bold text-white uppercase tracking-wide">
              Campus Events
            </h3>
            <p className="text-muted-foreground text-sm mt-3 mb-4 hidden md:block">
              Discover fests, workshops, and cultural events across
              universities. Never miss out on the buzz.
            </p>
            <Link
              href="/campuses"
              className="text-sm font-bold text-acid hover:text-white items-center uppercase tracking-wide transition-colors hidden md:flex mt-auto"
            >
              Explore Campuses{" "}
              <span className="material-symbols-outlined ml-1 text-sm">
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center py-6 px-4 md:py-8 md:px-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-sm hover:border-electric-purple/40 transition-all">
            <div className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl bg-electric-purple/10 text-electric-purple mb-3 md:mb-4">
              <span className="material-symbols-outlined text-3xl">trophy</span>
            </div>
            <h3 className="text-[11px] md:text-lg font-bold text-white uppercase tracking-wide">
              Sports Arena
            </h3>
            <p className="text-muted-foreground text-sm mt-3 mb-4 hidden md:block">
              Join tournaments, form teams, and compete in Inter-IIT sports and
              local leagues.
            </p>
            <Link
              href="/events?category=sports"
              className="text-sm font-bold text-electric-purple hover:text-white items-center uppercase tracking-wide transition-colors hidden md:flex mt-auto"
            >
              View Tournaments{" "}
              <span className="material-symbols-outlined ml-1 text-sm">
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center py-6 px-4 md:py-8 md:px-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-sm hover:border-blue-500/40 transition-all">
            <div className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-3 md:mb-4">
              <span className="material-symbols-outlined text-3xl">movie</span>
            </div>
            <h3 className="text-[11px] md:text-lg font-bold text-white uppercase tracking-wide">
              Entertainment
            </h3>
            <p className="text-muted-foreground text-sm mt-3 mb-4 hidden md:block">
              Catch the latest movie screenings, film festivals, and
              entertainment shows on campus.
            </p>
            <Link
              href="/events?category=entertainment"
              className="text-sm font-bold text-blue-500 hover:text-white items-center uppercase tracking-wide transition-colors hidden md:flex mt-auto"
            >
              Watch Now{" "}
              <span className="material-symbols-outlined ml-1 text-sm">
                arrow_forward
              </span>
            </Link>
          </div>

          {/* Feature 4 */}
          <div className="flex flex-col items-center text-center py-6 px-4 md:py-8 md:px-6 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-sm hover:border-acid/40 transition-all">
            <div className="inline-flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-xl bg-acid/10 text-acid mb-3 md:mb-4">
              <span className="material-symbols-outlined text-3xl">code</span>
            </div>
            <h3 className="text-[11px] md:text-lg font-bold text-white uppercase tracking-wide">
              Hackathons
            </h3>
            <p className="text-muted-foreground text-sm mt-3 mb-4 hidden md:block">
              Build, compete, and innovate in tech hackathons and coding
              competitions across campuses.
            </p>
            <Link
              href="/hackathons"
              className="text-sm font-bold text-acid hover:text-white items-center uppercase tracking-wide transition-colors hidden md:flex mt-auto"
            >
              View Hackathons{" "}
              <span className="material-symbols-outlined ml-1 text-sm">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
