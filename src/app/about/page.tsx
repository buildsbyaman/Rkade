import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-obsidian text-white">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] left-[-10%] h-[800px] w-[800px] rounded-full bg-electric-indigo/10 blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-acid/5 blur-[100px] pointer-events-none"></div>

            <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 relative z-10">

                {/* Hero Section */}
                <section className="mx-auto max-w-4xl text-center mb-24">
                    <h1 className="font-display text-5xl font-bold tracking-tighter sm:text-7xl mb-6">
                        Reframing <span className="text-acid">Campus Culture</span>
                    </h1>
                    <p className="mx-auto max-w-2xl text-xl text-gray-400 font-body leading-relaxed">
                        Rkade is the pulse of university life. We bridge the gap between students and the experiences that define their college years—from electric hackathons to championship sports.
                    </p>
                </section>

                {/* Mission Grid */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-acid/30">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-acid/10 text-acid">
                            <span className="material-symbols-outlined">hub</span>
                        </div>
                        <h3 className="mb-3 text-xl font-bold font-display">Connect</h3>
                        <p className="text-gray-400">
                            Uniting isolated campus silos into one vibrant, interconnected ecosystem where every event finds its audience.
                        </p>
                    </div>
                    <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-acid/30">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-electric-indigo/10 text-electric-indigo">
                            <span className="material-symbols-outlined">stadium</span>
                        </div>
                        <h3 className="mb-3 text-xl font-bold font-display">Compete</h3>
                        <p className="text-gray-400">
                            Providing a professional-grade platform for sports, esports, and hackathons. Your skills deserve a real arena.
                        </p>
                    </div>
                    <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-acid/30">
                        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                            <span className="material-symbols-outlined">rocket_launch</span>
                        </div>
                        <h3 className="mb-3 text-xl font-bold font-display">Create</h3>
                        <p className="text-gray-400">
                            Empowering student organizers with powerful tools to manage, promote, and sell tickets for their events.
                        </p>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="rounded-3xl bg-white/5 border border-white/10 p-12 text-center mb-24 backdrop-blur-md">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="space-y-2">
                            <div className="text-4xl font-black text-acid font-display">50+</div>
                            <div className="text-sm uppercase tracking-widest text-gray-500">Campuses</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-black text-white font-display">20k+</div>
                            <div className="text-sm uppercase tracking-widest text-gray-500">Students</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-black text-electric-indigo font-display">500+</div>
                            <div className="text-sm uppercase tracking-widest text-gray-500">Events</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-4xl font-black text-purple-400 font-display">∞</div>
                            <div className="text-sm uppercase tracking-widest text-gray-500">Memories</div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="text-center max-w-3xl mx-auto space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold font-display">Ready to level up?</h2>
                    <p className="text-gray-400 text-lg">Join thousands of students discovering their next passion on Rkade.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/auth/signup">
                            <Button className="bg-acid text-black hover:bg-white font-bold text-base px-8 h-12 rounded-full">
                                Get Started
                            </Button>
                        </Link>
                        <Link href="/campuses">
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold text-base px-8 h-12 rounded-full">
                                Explore Events
                            </Button>
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
