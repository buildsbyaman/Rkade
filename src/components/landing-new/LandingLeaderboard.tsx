"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getLeaderboard,
  type LeaderboardEntry,
} from "@/app/actions/leaderboard";

export function LandingLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error("Failed to load leaderboard", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <section className="relative bg-obsidian-light/50 py-32 hidden md:block">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-acid/5 to-transparent pointer-events-none"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div>
          <div>
            <div className="mb-8 flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-electric-purple to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                <span className="material-symbols-outlined">leaderboard</span>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white uppercase">
                  Top Students
                </h2>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="text-zinc-500 italic">Loading rankings...</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-zinc-500 italic p-4 border border-white/10 rounded-xl bg-glass">
                  No ranked students yet. Be the first to join an event!
                </div>
              ) : (
                leaderboard.map((user, index) => (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`group flex items-center gap-4 rounded-xl border p-4 transition-all ${
                      index === 0
                        ? "border-acid/20 bg-gradient-to-r from-acid/5 to-transparent hover:border-acid hover:from-acid/10 hover:shadow-neon-acid"
                        : "border-white/10 bg-glass hover:border-white/30 hover:bg-white/5"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center text-xl font-black italic ${index === 0 ? "text-acid" : "text-gray-500"}`}
                    >
                      #{user.rank}
                    </div>

                    <div className="flex flex-1 flex-col">
                      <h3
                        className={`text-base font-bold uppercase transition-colors ${index === 0 ? "text-white group-hover:text-acid" : "text-white"}`}
                      >
                        {user.firstName} {user.lastName}
                      </h3>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
