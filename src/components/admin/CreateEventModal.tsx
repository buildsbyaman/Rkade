"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Plus, Trash2, Calendar, Clock, MapPin, Tag, Film, User, Type, Palette, Layout, Globe, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createEvent } from "@/app/actions/events";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventModal({ isOpen, onClose, onSuccess }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);

  const addTimelineItem = () => {
    setTimeline([...timeline, { title: "", date: "", time: "", description: "", status: "upcoming" }]);
  };

  const removeTimelineItem = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index));
  };

  const updateTimelineItem = (index: number, field: string, value: string) => {
    const newTimeline = [...timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setTimeline(newTimeline);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    formData.append("timeline", JSON.stringify(timeline));

    try {
      const result = await createEvent(null, formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-[#0A0A0B] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <div>
              <h2 className="text-3xl font-display font-bold uppercase italic text-white tracking-tighter">
                Deploy New <span className="text-acid">Event</span>
              </h2>
              <p className="text-zinc-500 text-xs font-medium mt-1 uppercase tracking-widest">Initialize mission parameters and logistics.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-2xl bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="size-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-bold flex items-center gap-3">
                <Shield className="size-5" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Left Side: Essential Info */}
              <div className="space-y-10">
                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-1 w-6 bg-acid rounded-full"></div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Core Identity</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative group">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Event Title</label>
                      <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500 group-focus-within:text-acid transition-colors" />
                        <input 
                          required
                          name="title"
                          type="text" 
                          placeholder="e.g. CyberStrike 2026"
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Category</label>
                        <div className="relative">
                          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500 group-focus-within:text-acid transition-colors" />
                          <select 
                            required
                            name="category"
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium appearance-none"
                          >
                            <option value="Tech">Tech</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Design">Design</option>
                            <option value="Workshop">Workshop</option>
                            <option value="Hackathon">Hackathon</option>
                          </select>
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Event Type</label>
                        <input 
                          name="eventType"
                          type="text" 
                          placeholder="e.g. Tournament"
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium" 
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Description</label>
                      <textarea 
                        required
                        name="description"
                        rows={4}
                        placeholder="Detail the mission objectives..."
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium resize-none"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-1 w-6 bg-acid rounded-full"></div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Deployment Specs</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500 group-focus-within:text-acid transition-colors" />
                        <input 
                          required
                          name="date"
                          type="date" 
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium [color-scheme:dark]" 
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Time</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500 group-focus-within:text-acid transition-colors" />
                        <input 
                          required
                          name="time"
                          type="time" 
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium [color-scheme:dark]" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Venue / Field Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500 group-focus-within:text-acid transition-colors" />
                      <input 
                        required
                        name="location"
                        type="text" 
                        placeholder="e.g. Arena-X, Main Campus"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Price</label>
                      <input 
                        name="price"
                        type="text" 
                        placeholder="e.g. 199 or FREE"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium" 
                      />
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Duration</label>
                      <input 
                        name="duration"
                        type="text" 
                        placeholder="e.g. 4 Hours"
                        className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium" 
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Side: Assets & Timeline */}
              <div className="space-y-10">
                 <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="size-1 w-6 bg-acid rounded-full"></div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Visual Assets</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="group">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Landscape Poster URL</label>
                      <div className="relative">
                        <Layout className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500 group-focus-within:text-acid transition-colors" />
                        <input 
                          name="landscapeImage"
                          type="text" 
                          placeholder="https://..."
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium" 
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Portrait Poster URL</label>
                      <div className="relative">
                        <Film className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500 group-focus-within:text-acid transition-colors" />
                        <input 
                          name="portraitImage"
                          type="text" 
                          placeholder="https://..."
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium" 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Language</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                          <input 
                            name="language"
                            type="text" 
                            placeholder="English"
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium" 
                          />
                        </div>
                      </div>
                      <div className="group">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Age Rating</label>
                        <input 
                          name="ageRating"
                          type="text" 
                          placeholder="All Ages"
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium" 
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Performers (Comma separated)</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500" />
                        <input 
                          name="performers"
                          type="text" 
                          placeholder="e.g. John Doe, DJ Smith"
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium" 
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-1 w-6 bg-acid rounded-full"></div>
                      <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Operational Timeline</h3>
                    </div>
                    <Button 
                      type="button"
                      onClick={addTimelineItem}
                      variant="ghost" 
                      className="text-acid hover:bg-acid/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest"
                    >
                      <Plus className="mr-2 size-4" />
                      Add Phase
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {timeline.map((item, idx) => (
                      <div key={idx} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 relative group/item">
                        <button 
                          type="button"
                          onClick={() => removeTimelineItem(idx)}
                          className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                        >
                          <Trash2 className="size-4" />
                        </button>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <input 
                            placeholder="Phase Title (e.g. Check-in)"
                            value={item.title}
                            onChange={(e) => updateTimelineItem(idx, "title", e.target.value)}
                            className="bg-transparent border-b border-white/10 py-1 text-sm font-bold text-white focus:outline-none focus:border-acid transition-all"
                          />
                          <input 
                            type="date"
                            value={item.date}
                            onChange={(e) => updateTimelineItem(idx, "date", e.target.value)}
                            className="bg-transparent border-b border-white/10 py-1 text-xs text-zinc-500 focus:outline-none focus:border-acid transition-all [color-scheme:dark]"
                          />
                        </div>
                        <input 
                          placeholder="Brief description of this phase..."
                          value={item.description}
                          onChange={(e) => updateTimelineItem(idx, "description", e.target.value)}
                          className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-zinc-500 focus:outline-none focus:border-acid transition-all"
                        />
                      </div>
                    ))}
                    {timeline.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-white/[0.02] rounded-[2rem]">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">No phases scheduled</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>

            <section className="mt-12 pt-12 border-t border-white/5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="size-1 w-6 bg-acid rounded-full"></div>
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Registration Windows</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Registration Opens</label>
                  <input 
                    name="registrationStart"
                    type="datetime-local" 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium [color-scheme:dark]" 
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Registration Closes</label>
                  <input 
                    name="registrationEnd"
                    type="datetime-local" 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium [color-scheme:dark]" 
                  />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Result Declaration</label>
                  <input 
                    name="resultDate"
                    type="date" 
                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-4 text-white focus:outline-none focus:border-acid/50 transition-all font-medium [color-scheme:dark]" 
                  />
                </div>
              </div>
            </section>

            <div className="mt-12 flex items-center justify-end gap-4 bg-white/[0.02] -mx-8 -mb-8 p-8 border-t border-white/5">
              <Button 
                type="button"
                onClick={onClose}
                variant="outline" 
                className="border-white/10 text-zinc-400 hover:text-white rounded-2xl px-10 py-7 font-black uppercase tracking-widest"
              >
                Abort
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="bg-acid hover:bg-white text-black rounded-2xl px-12 py-7 font-black uppercase tracking-widest shadow-[0_0_30px_rgba(204,255,0,0.2)] disabled:opacity-50"
              >
                {loading ? "Initializing..." : "Engage System"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
