'use client';

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, Info, Clock, Plus, X, FileText, Presentation, Upload, Users } from "lucide-react";
import { createEvent } from "@/app/actions/events";
import { useFormStatus } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { ImageUpload } from "@/components/events/ImageUpload";
import { EventPreview } from "@/components/events/EventPreview";
import { isUserAdmin } from "@/lib/admin-auth";

interface CreateEventFormValues {
    title: string;
    theme: string;
    date: string;
    startDate: string;
    endDate: string;
    time: string;
    duration: string;
    eventType: string;
    ageRating: string;
    language: string;
    category: string;
    campusCategory?: string;
    location: string;
    isOnline: boolean;
    price: string;
    description: string;
    performers: string;
    performerInstagram?: string;
    performerLinkedin?: string;
    timeline?: string;
    m2mSchedule?: string;
    landscapeImage: string;
    portraitImage: string;
    pptUrl: string;
    pptTitle: string;
    timelineDocumentUrl: string;
    timelineDocumentTitle: string;
    timelineDocumentType: string;
    isTeamEvent: boolean;
    minTeamSize: number;
    maxTeamSize: number;
}

export default function CreateEventPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { register, control, watch, handleSubmit, setValue, formState: { errors } } = useForm<CreateEventFormValues>({
        defaultValues: {
            title: '',
            theme: 'Modern',
            date: '',
            startDate: '',
            endDate: '',
            time: '',
            duration: '',
            eventType: 'event',
            ageRating: 'U',
            language: 'English',
            category: 'cultural',
            location: '',
            isOnline: false,
            price: 'Free',
            description: '',
            performers: '',
            performerInstagram: '',
            performerLinkedin: '',
            timeline: '',
            landscapeImage: '',
            portraitImage: '',
            pptUrl: '',
            pptTitle: '',
            timelineDocumentUrl: '',
            timelineDocumentTitle: '',
            timelineDocumentType: 'pdf',
            isTeamEvent: false,
            minTeamSize: 2,
            maxTeamSize: 5
        }
    });

    const formValues = watch();
    const [isPending, setIsPending] = useState(false);
    const [m2mEnabled, setM2mEnabled] = useState(false);
    const [m2mEntries, setM2mEntries] = useState<Array<{ id: string; time: string; activity: string }>>([
        { id: '1', time: '', activity: '' }
    ]);

    const addM2mEntry = () => {
        const newId = (Math.max(...m2mEntries.map(e => parseInt(e.id) || 0), 0) + 1).toString();
        setM2mEntries([...m2mEntries, { id: newId, time: '', activity: '' }]);
    };

    const updateM2mEntry = (id: string, field: 'time' | 'activity', value: string) => {
        setM2mEntries(m2mEntries.map(entry => 
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    const removeM2mEntry = (id: string) => {
        if (m2mEntries.length > 1) {
            setM2mEntries(m2mEntries.filter(entry => entry.id !== id));
        }
    };

    const onSubmit = async (data: CreateEventFormValues) => {
        setIsPending(true);
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value.toString());
        });
        
        // Add M2M schedule if enabled
        if (m2mEnabled && m2mEntries.length > 0) {
            const m2mJson = JSON.stringify(m2mEntries);
            formData.append('m2mSchedule', m2mJson);
        }

        try {
            await createEvent(null, formData); // Assuming createEvent handles the redirect
        } catch (error) {
            console.error("Submission error", error);
        } finally {
            setIsPending(false);
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
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* LEFT COLUMN: FORM */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary">
                            <CalendarPlus className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-1 font-display uppercase italic">Create Event</h1>
                            <p className="text-zinc-400">
                                Fill in the details to publish your event on Rkade.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                        {/* SECTION 1: VISUALS */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Visuals</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Controller
                                    name="landscapeImage"
                                    control={control}
                                    render={({ field }) => (
                                        <ImageUpload
                                            label="Landscape Poster"
                                            bucket="posters"
                                            onUpload={(url) => field.onChange(url)}
                                            aspectRatio="landscape"
                                        />
                                    )}
                                />
                                <Controller
                                    name="portraitImage"
                                    control={control}
                                    render={({ field }) => (
                                        <ImageUpload
                                            label="Portrait Poster"
                                            bucket="posters"
                                            onUpload={(url) => field.onChange(url)}
                                            aspectRatio="portrait"
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        {/* SECTION 2: BASIC INFO */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Event Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="title">Event Name</Label>
                                    <Input id="title" {...register('title', { required: true })} placeholder="e.g. Neon Nights Cultural Fest" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="theme">Theme</Label>
                                    <select {...register('theme')} className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <option value="Modern" className="bg-zinc-900">Modern</option>
                                        <option value="Classic" className="bg-zinc-900">Classic</option>
                                        <option value="Cyberpunk" className="bg-zinc-900">Cyberpunk</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: SCHEDULE */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Schedule</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input id="startDate" type="date" {...register('startDate', { required: true })} className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input id="endDate" type="date" {...register('endDate', { required: true })} className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="time">Start Time</Label>
                                    <Input id="time" type="time" {...register('time', { required: true })} className="bg-white/5 border-white/10 text-white" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration</Label>
                                    <Input id="duration" {...register('duration')} placeholder="e.g. 2 hours" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: CATEGORIZATION */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Categorization</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="eventType">Event Type</Label>
                                    <select {...register('eventType')} className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <option value="event" className="bg-zinc-900">Event</option>
                                        <option value="contest" className="bg-zinc-900">Contest</option>
                                        <option value="workshop" className="bg-zinc-900">Workshop</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ageRating">Age Rating</Label>
                                    <select {...register('ageRating')} className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <option value="U" className="bg-zinc-900">U (Universal)</option>
                                        <option value="PG" className="bg-zinc-900">PG (Parental Guidance)</option>
                                        <option value="18+" className="bg-zinc-900">18+</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language">Language</Label>
                                    <select {...register('language')} className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <option value="English" className="bg-zinc-900">English</option>
                                        <option value="Spanish" className="bg-zinc-900">Spanish</option>
                                        <option value="Hindi" className="bg-zinc-900">Hindi</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <select {...register('category')} className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                        <option value="cultural" className="bg-zinc-900">Cultural</option>
                                        <option value="sports" className="bg-zinc-900">Sports</option>
                                        <option value="tech" className="bg-zinc-900">Tech</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 5: LOCATION & PRICING */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Location & Pricing</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input id="location" {...register('location', { required: true })} placeholder="e.g. Main Auditorium or Virtual Link" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price</Label>
                                    <Input id="price" {...register('price')} placeholder="Free or \u20b9500" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 6: TEAM EVENT CONFIGURATION */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                                <Users className="w-5 h-5" />
                                Team Configuration
                            </h2>
                            
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                                <input
                                    type="checkbox"
                                    id="isTeamEvent"
                                    {...register('isTeamEvent')}
                                    className="w-4 h-4 mt-1 rounded cursor-pointer"
                                />
                                <div className="flex-1">
                                    <label htmlFor="isTeamEvent" className="block text-sm font-medium text-white cursor-pointer">
                                        This is a team event
                                    </label>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        Enable this if participants need to register as teams rather than individuals
                                    </p>
                                </div>
                            </div>

                            {watch('isTeamEvent') && (
                                <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="minTeamSize">Minimum Team Size</Label>
                                            <Input 
                                                id="minTeamSize" 
                                                type="number" 
                                                min="1"
                                                {...register('minTeamSize', { 
                                                    valueAsNumber: true,
                                                    min: 1 
                                                })} 
                                                placeholder="e.g. 2" 
                                                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" 
                                            />
                                            <p className="text-xs text-zinc-500">Minimum number of members required per team</p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maxTeamSize">Maximum Team Size</Label>
                                            <Input 
                                                id="maxTeamSize" 
                                                type="number" 
                                                min="1"
                                                {...register('maxTeamSize', { 
                                                    valueAsNumber: true,
                                                    min: 1 
                                                })} 
                                                placeholder="e.g. 5" 
                                                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" 
                                            />
                                            <p className="text-xs text-zinc-500">Maximum number of members allowed per team</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-2 text-xs text-amber-400 bg-amber-400/5 p-3 rounded border border-amber-400/20">
                                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <p>
                                            Users will be required to create or join a team during registration. Team size must be between the min and max values you specify.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SECTION 7: PERFORMER / SPEAKER INFO */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Performer / Speaker Info</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="performers">Performer or Speaker Name</Label>
                                    <Input id="performers" {...register('performers')} placeholder="Artist or performer name" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="performerInstagram">Instagram Handle (Optional)</Label>
                                        <Input id="performerInstagram" {...register('performerInstagram')} placeholder="@username" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="performerLinkedin">LinkedIn Profile (Optional)</Label>
                                        <Input id="performerLinkedin" {...register('performerLinkedin')} placeholder="https://linkedin.com/in/username" className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 8: MINUTE-TO-MINUTE SCHEDULE */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Event Timeline
                            </h2>
                            
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                                <input
                                    type="checkbox"
                                    id="m2m_enabled"
                                    checked={m2mEnabled}
                                    onChange={(e) => setM2mEnabled(e.target.checked)}
                                    className="w-4 h-4 mt-1 rounded cursor-pointer"
                                />
                                <div className="flex-1">
                                    <label htmlFor="m2m_enabled" className="block text-sm font-medium text-white cursor-pointer">
                                        Create a detailed minute-to-minute schedule
                                    </label>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        Add specific times and activities to help attendees know what's happening throughout the event
                                    </p>
                                </div>
                            </div>

                            {m2mEnabled && (
                                <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-zinc-400">Add activities and timings</p>
                                        <button
                                            type="button"
                                            onClick={addM2mEntry}
                                            className="flex items-center gap-2 px-3 py-1 bg-acid text-black rounded-lg hover:bg-acid/90 transition-colors text-sm font-medium"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add Slot
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {m2mEntries.map((entry, index) => (
                                            <div 
                                                key={entry.id}
                                                className="flex gap-3 items-start p-3 bg-white/10 rounded-lg border border-white/10"
                                            >
                                                <div className="flex-shrink-0 w-6 h-6 bg-acid text-black rounded-full flex items-center justify-center text-xs font-semibold">
                                                    {index + 1}
                                                </div>
                                                
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                    <div className="sm:col-span-1">
                                                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                                                            Time
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={entry.time}
                                                            onChange={(e) => updateM2mEntry(entry.id, 'time', e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-acid"
                                                        />
                                                    </div>
                                                    
                                                    <div className="sm:col-span-3">
                                                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                                                            Activity / Description
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={entry.activity}
                                                            onChange={(e) => updateM2mEntry(entry.id, 'activity', e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-acid"
                                                            placeholder="e.g. Opening ceremony, Keynote, Lunch break..."
                                                        />
                                                    </div>
                                                </div>

                                                {m2mEntries.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeM2mEntry(entry.id)}
                                                        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>


                                </div>
                            )}
                        </div>

                        {/* SECTION 9: DOCUMENTS & RESOURCES */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Event Resources
                            </h2>
                            
                            {/* PPT Upload Section */}
                            <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-acid/10 text-acid">
                                        <Presentation className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Event Presentation</h3>
                                        <p className="text-sm text-zinc-400">Upload a PowerPoint or PDF presentation for this event</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="pptTitle">Presentation Title</Label>
                                        <Input 
                                            id="pptTitle" 
                                            {...register('pptTitle')} 
                                            placeholder="e.g. Event Overview Presentation" 
                                            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="pptUrl">Presentation URL</Label>
                                        <Input 
                                            id="pptUrl" 
                                            {...register('pptUrl')} 
                                            placeholder="https://docs.google.com/presentation/..." 
                                            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="text-xs text-zinc-500 bg-white/5 p-3 rounded border border-white/10">
                                    <strong>Tip:</strong> You can upload to Google Drive, Dropbox, or any cloud service and paste the shareable link here. 
                                    Make sure the link allows public viewing.
                                </div>
                            </div>
                            
                            {/* Timeline Document Section */}
                            <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Timeline Document</h3>
                                        <p className="text-sm text-zinc-400">Upload a detailed timeline document (PDF, PPT, or image)</p>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="timelineDocumentTitle">Document Title</Label>
                                        <Input 
                                            id="timelineDocumentTitle" 
                                            {...register('timelineDocumentTitle')} 
                                            placeholder="e.g. Detailed Event Schedule" 
                                            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="timelineDocumentType">Document Type</Label>
                                        <select 
                                            {...register('timelineDocumentType')} 
                                            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        >
                                            <option value="pdf" className="bg-zinc-900">PDF</option>
                                            <option value="ppt" className="bg-zinc-900">PowerPoint</option>
                                            <option value="doc" className="bg-zinc-900">Document</option>
                                            <option value="image" className="bg-zinc-900">Image</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="timelineDocumentUrl">Document URL</Label>
                                    <Input 
                                        id="timelineDocumentUrl" 
                                        {...register('timelineDocumentUrl')} 
                                        placeholder="https://drive.google.com/file/..." 
                                        className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600" 
                                    />
                                </div>
                                
                                <div className="text-xs text-zinc-500 bg-white/5 p-3 rounded border border-white/10">
                                    <strong>Note:</strong> This document will be made available to admins when viewing the timeline. 
                                    Ensure the document is publicly accessible.
                                </div>
                            </div>
                        </div>

                        {/* SECTION 10: ADDITIONAL DETAILS */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Additional Info</h2>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        {...register('description', { required: true })}
                                        className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus-visible:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        placeholder="Tell us about your event..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex justify-end gap-4 border-t border-white/10">
                            <Button type="button" variant="ghost" className="text-zinc-400 hover:text-white">Cancel</Button>
                            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8" disabled={isPending}>
                                {isPending ? 'Publishing...' : 'Create Event'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* RIGHT COLUMN: PREVIEW */}
                <div className="hidden lg:block lg:col-span-5 relative">
                    <EventPreview
                        title={formValues.title}
                        date={formValues.startDate}
                        time={formValues.time}
                        location={formValues.location}
                        category={formValues.category}
                        image={formValues.landscapeImage}
                        portraitImage={formValues.portraitImage}
                        description={formValues.description}
                    />
                </div>
            </div>
        </div>
    );
}
