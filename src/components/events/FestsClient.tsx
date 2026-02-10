"use client";

import { EventCard } from "@/components/EventCard";
import { Ticket } from "lucide-react";

type Fest = {
    id: string;
    name: string;
    slug: string;
    landscape_url?: string;
    portrait_url?: string;
    date?: Date | string;
    dateFrom?: Date | string;
    venue?: string;
    campus?: string;
};

export function FestsClient({ initialFests }: { initialFests: Fest[] }) {
    return (
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-0 md:pt-12 relative z-10">
            {initialFests.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 mb-6">
                        <Ticket className="h-8 w-8 text-zinc-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        No Fests Found
                    </h3>
                    <p className="text-zinc-500">
                        Check back later as we add more fests.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {initialFests.map((fest, index) => (
                        <EventCard
                            key={fest.id}
                            title={fest.name}
                            slug={fest.slug}
                            href={`/fests/${fest.slug}`}
                            image={fest.landscape_url || fest.portrait_url || "/Assests/1.jpg"}
                            date={fest.date || fest.dateFrom || "2025-09-15"}
                            category={"Fest"}
                            location={fest.venue || ""}
                            campus={fest.campus}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
