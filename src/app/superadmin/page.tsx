"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Users, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  Activity,
  CreditCard,
  Zap,
  Globe,
  Database,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { isUserSuperAdmin } from "@/lib/admin-auth";

interface AdminUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  firstName: string;
  lastName: string;
}

export default function SuperAdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeEvents: 0,
    totalBookings: 0,
    revenue: "₹0",
    growth: "+0%"
  });
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats({
            totalUsers: data.totalUsers,
            activeEvents: data.totalEvents,
            totalBookings: data.totalBookings,
            revenue: data.revenue,
            growth: data.growth
          });
        }

        const adminsRes = await fetch("/api/superadmin/admins");
        if (adminsRes.ok) {
          const data = await adminsRes.json();
          setAdmins(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { label: "Total Platform Missionaries", value: stats.totalUsers, icon: Users, trend: "+12%", color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "Current Deployments", value: stats.activeEvents, icon: Calendar, trend: "Stable", color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { label: "Verified Data Punts", value: stats.totalBookings, icon: Database, trend: "+28%", color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { label: "Total Platform Revenue", value: stats.revenue, icon: CreditCard, trend: "+8.2%", color: "text-green-400", bg: "bg-green-400/10" },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-display font-bold uppercase tracking-tighter text-white">
             Super <span className="text-purple-500">Terminal</span>
           </h1>
           <p className="text-zinc-500 font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Highest clearance level: Alpha One</p>
        </div>
        <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-2 rounded-2xl">
           <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Global Encryption: Active</p>
           </div>
           <div className="size-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={card.label}
            className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/20 transition-all group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <card.icon size={80} />
             </div>
             <div className="relative z-10 space-y-6">
                <div className={`size-12 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center border border-white/5`}>
                   <card.icon size={22} />
                </div>
                <div>
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{card.label}</p>
                   <div className="flex items-baseline gap-3 mt-1">
                      <h3 className="text-3xl font-display font-bold text-white tracking-tighter">{card.value}</h3>
                      <span className="text-[10px] font-bold text-green-400">{card.trend}</span>
                   </div>
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <Link href="/superadmin/admins" className="group flex items-center justify-between p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] hover:bg-purple-500/5 hover:border-purple-500/20 transition-all">
            <div className="flex items-center gap-6">
               <div className="size-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-black text-xl border border-purple-500/20">CH</div>
               <div>
                  <span className="text-xs font-black text-zinc-500 transition-colors uppercase tracking-[0.2em] block mb-1">Personnel</span>
                  <span className="text-lg font-display font-bold text-white uppercase group-hover:text-purple-400 transition-colors">Council Hub</span>
               </div>
            </div>
            <ArrowUpRight className="size-6 text-zinc-600 group-hover:text-purple-400 transition-all" />
         </Link>

         <Link href="/superadmin/events" className="group flex items-center justify-between p-8 bg-white/[0.03] border border-white/5 rounded-[2rem] hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-all">
            <div className="flex items-center gap-6">
               <div className="size-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-xl border border-indigo-500/20">FL</div>
               <div>
                  <span className="text-xs font-black text-zinc-500 transition-colors uppercase tracking-[0.2em] block mb-1">Operations</span>
                  <span className="text-lg font-display font-bold text-white uppercase group-hover:text-indigo-400 transition-colors">Full Logistics</span>
               </div>
            </div>
            <ArrowUpRight className="size-6 text-zinc-600 group-hover:text-indigo-400 transition-all" />
         </Link>
         

      </div>
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <Shield className="size-5 text-purple-400" />
               <h2 className="text-xl font-display font-bold text-white uppercase tracking-tighter">Administrative Roster</h2>
            </div>
            <Link href="/superadmin/admins">
               <Button variant="ghost" className="text-zinc-500 hover:text-purple-400 text-[10px] font-black uppercase tracking-widest px-0">
                  Manage Council <ArrowUpRight className="ml-2 size-3" />
               </Button>
            </Link>
         </div>

         <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="bg-white/[0.01] border-b border-white/5 text-left">
                        <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Operative</th>
                        <th className="px-6 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Clearance</th>
                        <th className="px-6 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                     {loading ? (
                        [1, 2, 3].map(i => (
                           <tr key={i} className="animate-pulse">
                              <td className="px-8 py-6"><div className="h-4 w-32 bg-white/5 rounded"></div></td>
                              <td className="px-6 py-6"><div className="h-4 w-20 bg-white/5 rounded"></div></td>
                              <td className="px-6 py-6"><div className="h-4 w-16 bg-white/5 rounded"></div></td>
                           </tr>
                        ))
                     ) : (
                        admins.slice(0, 5).map((admin) => (
                           <tr key={admin.id} className="group hover:bg-white/[0.01] transition-colors">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                       <Users className="size-4 text-zinc-500" />
                                    </div>
                                    <div>
                                       <p className="text-xs font-bold text-white uppercase">{admin.firstName} {admin.lastName}</p>
                                       <p className="text-[10px] text-zinc-500 font-mono tracking-tighter">{admin.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-6">
                                 <span className={`text-[10px] font-black uppercase tracking-widest ${admin.role === 'SUPER_ADMIN' ? 'text-purple-400' : 'text-indigo-400'}`}>
                                    {admin.role}
                                 </span>
                              </td>
                              <td className="px-6 py-6">
                                 <div className="flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active</span>
                                 </div>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
