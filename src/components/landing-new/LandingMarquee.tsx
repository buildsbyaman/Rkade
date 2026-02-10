"use client";

export function LandingMarquee() {
    return (
        <div className="relative w-full border-b border-acid/20 bg-acid/10 py-3 overflow-hidden whitespace-nowrap z-40 backdrop-blur-sm">
            <div className="inline-flex items-center gap-12 animate-marquee">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-12">
                        <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                            <span className="material-symbols-outlined text-acid">bolt</span>{" "}
                            Trending: Neon Nights Concert
                        </span>
                        <span className="text-acid/30">///</span>
                        <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                            <span className="material-symbols-outlined text-acid">
                                schedule
                            </span>{" "}
                            Hackathon Reg Closes in 2h
                        </span>
                        <span className="text-acid/30">///</span>
                        <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white">
                            <span className="material-symbols-outlined text-acid">
                                trophy
                            </span>{" "}
                            Varsity Esports Finals Tonight
                        </span>
                        <span className="text-acid/30">///</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
