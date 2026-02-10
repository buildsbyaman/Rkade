"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { isUserAdmin, isUserSuperAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  CheckCircle2, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";

interface Event {
  id: string;
  eventName: string;
  date?: string;
  venue?: string;
  category?: string;
  price?: string;
  totalBookings?: number;
  verifiedBookings?: number;
  description?: string;
}

export default function AdminEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.email && isUserAdmin(session.user.email)) {
      fetchEvents();
    }
  }, [session?.user?.email]);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.eventName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: "Total Events", value: events.length, icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Total Bookings", value: events.reduce((acc, curr) => acc + (curr.totalBookings || 0), 0), icon: Users, color: "text-acid", bg: "bg-acid/10" },
    { label: "Check-ins", value: events.reduce((acc, curr) => acc + (curr.verifiedBookings || 0), 0), icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Conversion", value: `${Math.round((events.reduce((acc, curr) => acc + (curr.verifiedBookings || 0), 0) / (events.reduce((acc, curr) => acc + (curr.totalBookings || 0), 0) || 1)) * 100)}%`, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBA";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
             <div className="h-10 w-48 bg-white/5 rounded-lg"></div>
             <div className="h-4 w-64 bg-white/5 rounded-lg"></div>
          </div>
          <div className="h-12 w-32 bg-white/5 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white/5 rounded-3xl border border-white/5"></div>
          ))}
        </div>
        <div className="h-[400px] bg-white/5 rounded-3xl border border-white/5"></div>
      </div>
    );
  }

  const isSuperAdmin = isUserSuperAdmin(session?.user?.email, session?.user?.role);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tighter text-white">
            Event <span className="text-acid">Management</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-1">Monitor event health, attendance and logistics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.label}
            className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors relative group overflow-hidden"
          >
            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
               <stat.icon size={64} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} inline-flex shadow-inner`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                <h3 className="text-3xl font-display font-bold mt-1 text-white tracking-tighter">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-zinc-500 group-focus-within:text-acid transition-colors" />
          <input 
            type="text" 
            placeholder="Search by event name, venue, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-acid/50 focus:ring-1 focus:ring-acid/50 transition-all placeholder:text-zinc-600"
          />
        </div>
        <div className="flex gap-4">
           <div className="flex p-1 bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
             {["All", "Hackathons", "Tech"].map(cat => (
               <button
                 key={cat}
                 onClick={() => setSelectedCategory(cat)}
                 className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                   selectedCategory === cat ? "bg-acid text-black" : "text-zinc-500 hover:text-white"
                 }`}
               >
                 {cat}
               </button>
             ))}
           </div>
           <Button variant="outline" className="border-white/5 bg-white/[0.03] rounded-2xl px-6 py-7 text-zinc-400">
             <Filter className="size-5" />
           </Button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-8 py-6 text-left text-[10px] font-black text-zinc-500 font-display uppercase tracking-[0.2em]">Event Detail</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-zinc-500 font-display uppercase tracking-[0.2em]">Logistics</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-zinc-500 font-display uppercase tracking-[0.2em]">Performance</th>
                <th className="px-6 py-6 text-left text-[10px] font-black text-zinc-500 font-display uppercase tracking-[0.2em]">Conversion</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-zinc-500 font-display uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              <AnimatePresence mode="popLayout">
                {filteredEvents.map((event, idx) => {
                  const verifiedRate = Math.round(((event.verifiedBookings || 0) / (event.totalBookings || 1)) * 100);
                  
                  return (
                    <motion.tr 
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/events/${event.id}`)}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center text-acid font-black text-lg overflow-hidden relative group-hover:scale-110 transition-transform">
                              {event.eventName.charAt(0)}
                              <div className="absolute inset-0 bg-acid opacity-0 group-hover:opacity-10 transition-opacity"></div>
                           </div>
                           <div>
                             <h4 className="text-white font-bold group-hover:text-acid transition-colors">{event.eventName}</h4>
                             <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">{event.category || "General"}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-zinc-400">
                             <Calendar className="size-3 text-acid" />
                             <span className="text-xs font-medium">{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400">
                             <MapPin className="size-3 text-zinc-600" />
                             <span className="text-[10px] font-bold uppercase truncate max-w-[120px]">{event.venue || "TBA"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <span className="text-lg font-black text-white">{event.totalBookings || 0}</span>
                             <span className="text-[10px] font-bold text-zinc-500 uppercase">Booked</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-xs font-bold text-acid">{event.verifiedBookings || 0}</span>
                             <span className="text-[10px] font-bold text-zinc-600 uppercase">Verified</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="w-full max-w-[100px] space-y-2">
                           <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className={verifiedRate > 50 ? "text-green-400" : "text-yellow-400"}>{verifiedRate}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${verifiedRate}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className={`h-full rounded-full ${verifiedRate > 50 ? "bg-green-400" : "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]"}`} 
                              />
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Link href={`/admin/events/${event.id}`} onClick={(e) => e.stopPropagation()}>
                              <Button size="icon" variant="ghost" className="rounded-xl border border-white/5 hover:bg-acid hover:text-black transition-all">
                                 <ChevronRight className="size-4" />
                              </Button>
                           </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredEvents.length === 0 && (
            <div className="p-20 text-center space-y-4">
               <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Search className="size-8 text-zinc-600" />
               </div>
               <h3 className="text-xl font-bold text-white">No events found</h3>
               <p className="text-zinc-500 max-w-xs mx-auto">Try adjusting your search terms or filters to find what you&apos;re looking for.</p>
               <Button 
                variant="outline" 
                className="border-white/10 hover:bg-white/5 py-6 px-8 rounded-2xl"
                onClick={() => {setSearchTerm(""); setSelectedCategory("All");}}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </motion.div>

    </div>
  );
}
