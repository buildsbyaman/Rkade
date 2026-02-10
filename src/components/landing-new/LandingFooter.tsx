"use client";

export function LandingFooter() {
    return (
        <footer className="border-t border-glass-border bg-obsidian-light py-12 text-center md:text-left relative z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-4">
                    <div className="col-span-1 md:col-span-2">
                        <div className="mb-6 flex items-center justify-center md:justify-start gap-2">
                            <span className="material-symbols-outlined text-acid text-3xl">
                                stadia_controller
                            </span>
                            <span className="text-2xl font-display font-black text-white uppercase italic">
                                Rkade<span className="text-acid">.</span>
                            </span>
                        </div>
                        <p className="max-w-xs mx-auto md:mx-0 text-sm text-gray-500 font-mono leading-relaxed">
                            The ultimate platform for university campus life.
                        </p>
                    </div>
                    <div>
                        <h4 className="mb-6 font-bold text-white uppercase tracking-wider text-sm">
                            Explore
                        </h4>
                        <ul className="space-y-3 text-sm text-gray-500 font-medium">
                            <li>
                                <a className="hover:text-acid transition-colors" href="#">
                                    All Events
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-acid transition-colors" href="#">
                                    Clubs &amp; Organizations
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-acid transition-colors" href="#">
                                    Campus Map
                                </a>
                            </li>
                            <li>
                                <a className="hover:text-acid transition-colors" href="#">
                                    Leaderboard
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="mb-6 font-bold text-white uppercase tracking-wider text-sm">
                            Join the Lobby
                        </h4>
                        <p className="mb-4 text-xs text-gray-500 font-mono">
                            Subscribe for weekly event drops.
                        </p>
                        <div className="flex items-center">
                            <input
                                className="w-full rounded-l-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-acid focus:ring-1 focus:ring-acid focus:outline-none"
                                placeholder="Email address"
                                type="email"
                            />
                            <button className="rounded-r-lg bg-acid px-3 py-2 text-black hover:bg-white transition-colors">
                                <span className="material-symbols-outlined text-sm font-bold">
                                    arrow_forward
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-white/5 pt-8 text-center text-xs text-gray-600 font-mono">
                    © 2026 Rkade Platform. All rights reserved.{" "}
                    <span className="text-gray-800">System v2.0.4</span>
                </div>
            </div>
        </footer>
    );
}
