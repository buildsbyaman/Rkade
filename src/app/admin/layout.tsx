"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { isUserAdmin } from "@/lib/admin-auth";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  QrCode, 
  Settings, 
  LogOut, 
  ChevronRight,
  Menu,
  X,
  Calendar,
  ExternalLink,
  Shield,
  ShieldAlert,
  MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const getSidebarLinks = (role?: string) => {
  const links = [
    { name: "Terminal", href: "/admin", icon: LayoutDashboard },
    { name: "Event Logistics", href: "/admin/events", icon: Calendar },
    { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    { name: "Ticket Scanner", href: "/admin/verify", icon: QrCode },
  ];

  if (role === "SUPER_ADMIN") {
    links.push({ name: "Super Admin", href: "/superadmin", icon: Shield });
  }

  return links;
};

import { Users } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarLinks = getSidebarLinks(session?.user?.role);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-acid border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Initialising Admin</p>
        </div>
      </div>
    );
  }

  if (!session || !isUserAdmin(session.user?.email, session.user?.role)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden">
      <aside 
        className={`hidden md:flex flex-col border-r border-white/5 bg-[#0A0A0B] transition-all duration-300 relative z-30 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <Link href="/admin" className="p-6 flex items-center gap-3 group/logo">
          <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 group-hover/logo:scale-110 transition-transform">
             <img src="/favicon.ico" alt="Rkade" className="w-10 h-10 object-contain" />
          </div>
          {isSidebarOpen && (
            <span className="font-display font-bold text-xl tracking-tighter group-hover/logo:text-acid transition-colors text-white">ADMIN<span className="text-acid">.</span></span>
          )}
        </Link>

        <nav className="flex-1 px-3 py-4 space-y-2">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${
                  isActive 
                    ? "bg-acid/10 text-acid" 
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`size-5 ${isActive ? "text-acid" : "group-hover:text-white"}`} />
                {isSidebarOpen && (
                  <span className="font-bold text-sm uppercase tracking-wider">{link.name}</span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-acid rounded-r-full" 
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
          >
            <ChevronRight className={`size-5 transition-transform duration-300 ${isSidebarOpen ? "rotate-180" : ""}`} />
            {isSidebarOpen && <span className="font-bold text-sm uppercase tracking-wider">Collapse</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md px-6 flex items-center justify-between relative z-20">
          <div className="flex items-center gap-4">
             <button 
               className="md:hidden text-zinc-400"
               onClick={() => setIsMobileMenuOpen(true)}
             >
               <Menu className="size-6" />
             </button>
             <Link href="/admin" className="hover:text-white transition-colors">
               <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 hidden sm:block">
                 {sidebarLinks.find(l => pathname === l.href || (l.href !== "/admin" && pathname.startsWith(l.href)))?.name || "Event Management"}
               </h2>
             </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" className="border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest px-4 py-2 h-auto text-zinc-400 hover:text-acid hover:border-acid/20 rounded-xl transition-all">
                User Portal <ExternalLink className="size-3 ml-2" />
              </Button>
            </Link>
            <div className="h-8 w-px bg-white/5 mx-2"></div>
            <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                   <p className="text-xs font-bold text-white uppercase">{session.user?.name}</p>
                   <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                     {session.user?.role?.replace("_", " ")}
                   </p>
                </div>
               <img 
                 src={session.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user?.email}`}
                 className="size-8 rounded-lg border border-white/10"
                 alt="profile"
               />
            </div>
            <div className="h-8 w-px bg-white/5 mx-2"></div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-all"
              title="Sign Out"
            >
               <LogOut className="size-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#050505] relative custom-scrollbar">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-acid/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="p-6 md:p-8 relative z-10 w-full max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            className="absolute top-0 left-0 bottom-0 w-72 bg-[#0A0A0B] border-r border-white/5 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
               <Link href="/admin" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-10 h-10 flex items-center justify-center">
                    <img src="/favicon.ico" alt="Rkade" className="w-10 h-10 object-contain" />
                  </div>
                  <span className="font-display font-bold text-xl tracking-tighter text-white">ADMIN<span className="text-acid">.</span></span>
               </Link>
               <button onClick={() => setIsMobileMenuOpen(false)} className="text-zinc-500 hover:text-white">
                  <X className="size-6" />
               </button>
            </div>

            <nav className="flex-1 space-y-2">
              {sidebarLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
                const Icon = link.icon;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl transition-all ${
                      isActive 
                        ? "bg-acid text-black font-black" 
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="size-5" />
                    <span className="uppercase tracking-widest text-sm">{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <Button 
              variant="outline" 
              className="mt-4 border-white/10 text-zinc-400 mb-8"
              onClick={() => router.push("/")}
            >
              Exit Admin Control
            </Button>
          </motion.aside>
        </div>
      )}
    </div>
  );
}
