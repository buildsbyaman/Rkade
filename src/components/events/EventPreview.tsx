'use client';

import { Calendar, Clock, MapPin, User, Tag } from 'lucide-react';
import Image from 'next/image';

interface EventPreviewProps {
    title?: string;
    date?: string;
    time?: string;
    location?: string;
    category?: string;
    image?: string;
    portraitImage?: string;
    description?: string;
}

export function EventPreview({
    title = "Event Title",
    date,
    time,
    location = "Location",
    category = "Event",
    image,
    portraitImage,
    description
}: EventPreviewProps) {
    return (
        <div className="sticky top-24 space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-acid">visibility</span>
                    Live Preview
                </h3>

                {/* Landscape Card Preview */}
                <div className="group relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/10 shadow-xl transition-all hover:shadow-neon-acid/20 hover:border-acid/30">
                    <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
                        {image ? (
                            <Image
                                src={image}
                                alt="Event cover"
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-700">
                                <span className="material-symbols-outlined text-6xl">image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
                            <div className="mb-2">
                                <span className="inline-flex items-center rounded-full border border-acid/20 bg-acid/10 px-2.5 py-0.5 text-xs font-semibold text-acid backdrop-blur-md">
                                    {category}
                                </span>
                            </div>
                            <h3 className="text-2xl font-bold text-white line-clamp-2 leading-tight mb-2 font-display uppercase italic">{title}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-300">
                                {(date || time) && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-acid" />
                                        <span>{date || 'Date'} • {time || 'Time'}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-acid" />
                                    <span className="line-clamp-1">{location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Portrait Card Preview (Mini) */}
            {portraitImage && (
                <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Portrait View</h4>
                    <div className="aspect-[9/16] w-32 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 relative shadow-lg">
                        <Image
                            src={portraitImage}
                            alt="Portrait cover"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-3 flex flex-col justify-end">
                            <p className="text-white text-[10px] font-bold uppercase leading-tight line-clamp-2">{title}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
