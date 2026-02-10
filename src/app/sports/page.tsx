import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Trophy, PlusCircle } from "lucide-react";

export default function SportsPage() {
    const tournaments = [
        {
            id: "s1",
            title: "Inter-University Football League",
            slug: "inter-university-football-league",
            date: "Starts April 10, 2026",
            location: "University Stadium",
            category: "Football",
            image: "",
            price: "$50/Team",
        },
        {
            id: "s2",
            title: "Badminton Open Championship",
            slug: "badminton-open-championship",
            date: "March 28, 2026",
            location: "Indoor Sports Complex",
            category: "Badminton",
            image: "",
            price: "$10/Entry",
        },
        {
            id: "s3",
            title: "Chess Masters Tournament",
            slug: "chess-masters-tournament",
            date: "April 05, 2026",
            location: "Student Hall A",
            category: "Indoor Games",
            image: "",
            price: "Free",
        },
        {
            id: "s4",
            title: "Varsity Cricket Cup",
            slug: "varsity-cricket-cup",
            date: "May 01, 2026",
            location: "Main Cricket Ground",
            category: "Cricket",
            image: "",
            price: "$100/Team",
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
                        <Trophy className="h-8 w-8 text-yellow-500" />
                        Sports Arena
                    </h1>
                    <p className="text-zinc-400">Join tournaments, form teams, and compete for glory.</p>
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Team
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tournaments.map((game) => (
                    <EventCard key={game.id} {...game} />
                ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center mt-12">
                <h3 className="text-xl font-bold text-white mb-2">Want to host a tournament?</h3>
                <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
                    Organize your own sports event managed entirely through Rkade.
                </p>
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">Host Tournament</Button>
            </div>
        </div>
    );
}
