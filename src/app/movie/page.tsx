import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Film, PlayCircle } from "lucide-react";

export default function MoviesPage() {
    const movies = [
        {
            id: "m1",
            title: "Campus Film Festival: Indie Gems",
            slug: "campus-film-festival-indie-gems",
            date: "This Weekend • 6:00 PM",
            location: "Open Air Theatre",
            category: "Festival",
            image: "",
            price: "Free",
        },
        {
            id: "m2",
            title: "Movie Night: Interstellar",
            slug: "movie-night-interstellar",
            date: "Friday Night • 8:00 PM",
            location: "Main Auditorium",
            category: "Screening",
            image: "",
            price: "$2",
        },
        {
            id: "m3",
            title: "Documentary: The Future of AI",
            slug: "documentary-the-future-of-ai",
            date: "Wednesday • 5:00 PM",
            location: "Seminar Hall",
            category: "Documentary",
            image: "",
            price: "Free",
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                        <Film className="h-8 w-8 text-pink-500" />
                        Entertainment
                    </h1>
                    <p className="text-zinc-400">Catch the latest screenings and film festivals.</p>
                </div>
            </div>

            <div className="rounded-2xl overflow-hidden relative h-[400px] border border-white/10 mb-12 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                {/* Placeholder Hero Image */}
                <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                    <span className="text-zinc-600 font-bold text-4xl">Featured Premiere</span>
                </div>

                <div className="absolute bottom-0 left-0 p-8 z-20 w-full md:w-2/3 space-y-4">
                    <div className="inline-flex px-3 py-1 rounded-full bg-pink-500 text-white text-xs font-bold">
                        Premiere
                    </div>
                    <h2 className="text-4xl font-bold text-white">The Student Chronicles</h2>
                    <p className="text-zinc-300 line-clamp-2">
                        An award-winning short film directed by the university&apos;s own film club. Experience the journey of campus life like never before.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <Button className="bg-white text-black hover:bg-white/90">
                            <PlayCircle className="mr-2 h-4 w-4" /> Watch Trailer
                        </Button>
                        <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                            Get Tickets
                        </Button>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Screenings</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {movies.map((movie) => (
                    <EventCard key={movie.id} {...movie} />
                ))}
            </div>
        </div>
    );
}
