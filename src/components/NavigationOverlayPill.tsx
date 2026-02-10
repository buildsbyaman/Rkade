"use client";

import { useRouter, usePathname } from "next/navigation";

export function NavigationOverlayPill() {
  const router = useRouter();
  const pathname = usePathname();

  // Determine which button should be highlighted based on pathname
  const isActive = (route: string) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  };

  return (
    <div className="fixed bottom-6 right-4 left-4 flex justify-center z-50 lg:hidden">
      <div className="flex gap-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-3 py-2.5 shadow-xl">
        <button
          onClick={() => router.push("/")}
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full transition-all active:scale-95 ${
            isActive("/") ? "bg-white/10 hover:bg-white/15" : "hover:bg-white/5"
          }`}
          title="Home"
        >
          <span
            className={`material-symbols-outlined text-lg ${
              isActive("/")
                ? "text-electric-indigo font-bold"
                : "text-electric-indigo/80"
            }`}
          >
            home
          </span>
        </button>
        <button
          onClick={() => router.push("/events")}
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full transition-all active:scale-95 ${
            isActive("/events")
              ? "bg-acid/30 hover:bg-acid/40"
              : "hover:bg-acid/10"
          }`}
          title="Discover Events"
        >
          <span
            className={`material-symbols-outlined text-2xl ${
              isActive("/events") ? "text-acid font-bold" : "text-acid"
            }`}
            style={{ lineHeight: 1 }}
          >
            calendar_month
          </span>
        </button>
        <button
          onClick={() => router.push("/campuses")}
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full transition-all active:scale-95 ${
            isActive("/campuses")
              ? "bg-white/10 hover:bg-white/15"
              : "hover:bg-white/5"
          }`}
          title="Campuses"
        >
          <span
            className={`material-symbols-outlined text-lg ${
              isActive("/campuses") ? "text-white font-bold" : "text-white/80"
            }`}
          >
            school
          </span>
        </button>
        <button
          onClick={() => router.push("/fests")}
          className={`flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-full transition-all active:scale-95 ${
            isActive("/fests")
              ? "bg-electric-purple/20 hover:bg-electric-purple/30"
              : "hover:bg-electric-purple/10"
          }`}
          title="Fests"
        >
          <span
            className={`material-symbols-outlined text-lg ${
              isActive("/fests")
                ? "text-electric-purple font-bold"
                : "text-electric-purple/80"
            }`}
          >
            celebration
          </span>
        </button>
      </div>
    </div>
  );
}
