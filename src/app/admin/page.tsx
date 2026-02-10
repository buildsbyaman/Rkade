"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Ticket, 
  TrendingUp, 
  ArrowUpRight, 
  Activity,
  CreditCard,
  Zap,
  Globe,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { isUserAdmin, isUserSuperAdmin } from "@/lib/admin-auth";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeEvents: 0,
    totalBookings: 0,
    revenue: "₹0",
    growth: "+0%"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalUsers: data.totalUsers,
            activeEvents: data.totalEvents,
            totalBookings: data.totalBookings,
            revenue: data.revenue,
            growth: data.growth
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Missionaries", value: stats.totalUsers, icon: Users, trend: "+12%", color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Active Deployments", value: stats.activeEvents, icon: Calendar, trend: "Stable", color: "text-acid", bg: "bg-acid/10" },
    { label: "Tickets Issued", value: stats.totalBookings, icon: Ticket, trend: "+28%", color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Gross Revenue", value: stats.revenue, icon: CreditCard, trend: "+8.2%", color: "text-green-400", bg: "bg-green-400/10" },
  ];

  const canAccessSettings = isUserSuperAdmin(session?.user?.email, session?.user?.role);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-display font-bold uppercase tracking-tighter text-white">
             Control <span className="text-acid">Terminal</span>
           </h1>
           <p className="text-zinc-500 font-medium mt-1">Global platform overview and mission intelligence.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-2 rounded-2xl">
           <div className="px-4 py-2 bg-acid/10 border border-acid/20 rounded-xl">
              <p className="text-[10px] font-black text-acid uppercase tracking-widest">System Status: Nominal</p>
           </div>
           <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={card.label}
            className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <card.icon size={80} />
             </div>
             <div className="relative z-10 space-y-6">
                <div className={`size-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center`}>
                   <card.icon size={24} />
                </div>
                <div>
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{card.label}</p>
                   <div className="flex items-baseline gap-3 mt-1">
                      <h3 className="text-3xl font-display font-bold text-white tracking-tighter">{card.value}</h3>
                      <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{card.trend}</span>
                   </div>
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/admin/events" className="group flex items-center justify-between p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] hover:bg-white/[0.05] hover:border-white/10 transition-all">
               <div className="flex items-center gap-6">
                  <div className="size-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-xl">EV</div>
                  <div>
                     <span className="text-xs font-black text-zinc-500 transition-colors uppercase tracking-[0.2em] block mb-1">Logistics</span>
                     <span className="text-lg font-display font-bold text-white uppercase group-hover:text-acid transition-colors">Manage Events</span>
                  </div>
               </div>
               <ArrowUpRight className="size-6 text-zinc-600 group-hover:text-acid group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
            
            <Link href="/admin/verify" className="group flex items-center justify-between p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] hover:bg-white/[0.05] hover:border-white/10 transition-all">
               <div className="flex items-center gap-6">
                  <div className="size-16 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center font-black text-xl">VS</div>
                  <div>
                     <span className="text-xs font-black text-zinc-500 transition-colors uppercase tracking-[0.2em] block mb-1">Scanning</span>
                     <span className="text-lg font-display font-bold text-white uppercase group-hover:text-acid transition-colors">Scanner Hub</span>
                  </div>
               </div>
               <ArrowUpRight className="size-6 text-zinc-600 group-hover:text-acid group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>

            {canAccessSettings && (
               <Link href="/superadmin" className="group flex items-center justify-between p-8 bg-purple-500/5 border border-purple-500/10 rounded-[2rem] hover:bg-purple-500/10 hover:border-purple-500/20 transition-all">
                  <div className="flex items-center gap-6">
                     <div className="size-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-xl border border-purple-500/20">SA</div>
                     <div>
                        <span className="text-xs font-black text-zinc-500 transition-colors uppercase tracking-[0.2em] block mb-1">Clearance</span>
                        <span className="text-lg font-display font-bold text-white uppercase group-hover:text-purple-400 transition-colors">Super Admin Terminal</span>
                     </div>
                  </div>
                  <ArrowUpRight className="size-6 text-zinc-600 group-hover:text-purple-400 transition-all" />
               </Link>
            )}
         </div>
      </div>
    </div>
  );
}
