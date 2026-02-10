'use client';

import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { ImageUpload } from '@/components/ImageUpload';
import { Loader2, Calendar, Clock, MapPin, AlignLeft, DollarSign, Tag, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { isUserAdmin } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateEventPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [eventTypes, setEventTypes] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        eventName: '',
        description: '',
        landscapePoster: '',
        portraitPoster: '',
        date: '',
        time: '',
        duration: '',
        venue: '',
        price: '',
        category: '',
        language: 'English',
        ageLimit: 'U',
        performers: '',
        eventType: 'event',
        isTeamEvent: false,
        minTeamSize: 1,
        maxTeamSize: 1,
    });

    // Fetch event types on load
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const response = await fetch('/api/event-types');
                if (response.ok) {
                    const data = await response.json();
                    setEventTypes(data);
                }
            } catch (error) {
                console.error('Error fetching event types:', error);
            }
        };
        fetchTypes();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substr(2, 5);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const slug = generateSlug(formData.eventName);

            const response = await fetch('/api/events/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    slug,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create event');
            }

            const data = await response.json();
            router.push(`/events/${data.slug}`);
        } catch (error: any) {
            console.error('Error creating event:', error);
            alert('Error creating event: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                    <p className="mt-4">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="bg-glass border-white/10 text-white w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Access Restricted</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Please sign in to create events
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => router.push("/auth/signin")}
                            className="w-full bg-acid text-black hover:bg-acid-hover"
                        >
                            Sign In
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isUserAdmin(session.user?.email)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="bg-glass border-white/10 text-white w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Admin Only</CardTitle>
                        <CardDescription className="text-zinc-400">
                            You do not have permission to create events.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => router.push("/events")}
                            className="w-full bg-acid text-black hover:bg-acid-hover"
                        >
                            Go to Events
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20 pt-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-foreground mb-2">Create New Event</h1>
                <p className="text-gray-500 dark:text-gray-400">Fill in the details to publish your event.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Section 1: Basic Info */}
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
                        <Tag className="w-5 h-5 mr-2 text-purple-500" />
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Event Name *</label>
                            <input
                                required
                                name="eventName"
                                value={formData.eventName}
                                onChange={handleChange}
                                placeholder="e.g. Summer Music Festival 2025"
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Describe what attendees can expect..."
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-foreground mb-1">Event Type *</label>
                            <select
                                name="eventType"
                                value={formData.eventType}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none"
                            >
                                <option value="" disabled>Select event type</option>
                                {eventTypes.map(type => (
                                    <option key={type.id} value={type.slug}>{type.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
                            <input
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="e.g. Music, Workshop, Sports"
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Media */}
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
                        <AlignLeft className="w-5 h-5 mr-2 text-purple-500" />
                        Media & Visuals
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageUpload
                            label="Landscape Poster (16:9) *"
                            value={formData.landscapePoster}
                            onChange={(url) => setFormData(prev => ({ ...prev, landscapePoster: url }))}
                            aspectRatio="landscape"
                        />
                        <ImageUpload
                            label="Portrait Poster (3:4) *"
                            value={formData.portraitPoster}
                            onChange={(url) => setFormData(prev => ({ ...prev, portraitPoster: url }))}
                            aspectRatio="portrait"
                        />
                    </div>
                </div>

                {/* Section 3: Date, Time & Location */}
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-purple-500" />
                        Logistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Date *</label>
                            <input
                                type="date"
                                required
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Time *</label>
                            <input
                                type="time"
                                required
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Duration *</label>
                            <input
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder="e.g. 2 hours"
                                required
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-foreground mb-1">Venue Name / Location *</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    required
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    placeholder="e.g. The Grand Arena, Mumbai"
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Details */}
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-purple-500" />
                        Additional Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Price (₹) *</label>
                            <input
                                required
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0 for Free"
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Age Limit *</label>
                            <select
                                name="ageLimit"
                                value={formData.ageLimit}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            >
                                <option value="U">Universal (U)</option>
                                <option value="U/A">Parental Guidance (U/A)</option>
                                <option value="A">Adults Only (18+)</option>
                                <option value="PG13">PG-13</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Language *</label>
                            <select
                                name="language"
                                value={formData.language}
                                onChange={handleChange}
                                required
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            >
                                <option>English</option>
                                <option>Hindi</option>
                                <option>Punjabi</option>
                                <option>Tamil</option>
                                <option>Telugu</option>
                                <option>Multilingual</option>
                            </select>
                        </div>
                        <div className="col-span-full">
                            <label className="block text-sm font-medium text-foreground mb-1">Performers / Artists *</label>
                            <input
                                name="performers"
                                value={formData.performers}
                                onChange={handleChange}
                                placeholder="e.g. Arijit Singh, Coldplay"
                                required
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 5: Team Event Settings */}
                <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-purple-500" />
                        Team Event Settings
                    </h2>
                    <div className="space-y-6">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isTeamEvent"
                                name="isTeamEvent"
                                checked={formData.isTeamEvent}
                                onChange={handleChange}
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                            />
                            <label htmlFor="isTeamEvent" className="ml-2 text-sm font-medium text-foreground">
                                This is a team event
                            </label>
                        </div>

                        {formData.isTeamEvent && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-white/10">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Minimum Team Size</label>
                                    <input
                                        type="number"
                                        name="minTeamSize"
                                        value={formData.minTeamSize}
                                        onChange={handleChange}
                                        min="1"
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Maximum Team Size</label>
                                    <input
                                        type="number"
                                        name="maxTeamSize"
                                        value={formData.maxTeamSize}
                                        onChange={handleChange}
                                        min={formData.minTeamSize}
                                        className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mr-4 px-8 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-foreground font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-10 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/25 transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : 'Create Event'}
                    </button>
                </div>

            </form>
        </div>
    );
}
