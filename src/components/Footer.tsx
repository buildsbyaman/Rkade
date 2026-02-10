import Link from "next/link";
import { Instagram, Facebook, Linkedin, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-obsidian/80 backdrop-blur-xl py-12 relative z-10 transition-colors">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <img src="/favicon.ico" alt="Rkade" className="w-7 h-7" />
              <span className="text-xl font-bold tracking-tight text-white lowercase">
                rkade
              </span>
            </div>
            <p className="text-sm text-zinc-400 text-center md:text-left">
              Made for the players.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Socials
            </h3>
            <Link
              href="#"
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-secondary uppercase group"
            >
              <Instagram className="h-4 w-4 group-hover:text-secondary transition-colors" />
              <span>Instagram</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-secondary uppercase group"
            >
              <Linkedin className="h-4 w-4 group-hover:text-secondary transition-colors" />
              <span>LinkedIn</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-secondary uppercase group"
            >
              <Facebook className="h-4 w-4 group-hover:text-secondary transition-colors" />
              <span>Facebook</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-secondary uppercase group"
            >
              <Globe className="h-4 w-4 group-hover:text-secondary transition-colors" />
              <span>Website</span>
            </Link>
          </div>

          {/* Removed other links for clean Brutalist look as per prompt */}
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-zinc-600 uppercase tracking-widest">
          © 2026 Rkade.
        </div>
      </div>
    </footer>
  );
}
