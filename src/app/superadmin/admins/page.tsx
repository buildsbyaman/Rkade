"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { isUserSuperAdmin } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Shield, 
  UserPlus, 
  Trash2, 
  Mail,
  ShieldCheck,
  ShieldAlert,
  ChevronRight
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  firstName: string;
  lastName: string;
}

export default function SuperAdminAdminsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/superadmin/admins");
        if (!response.ok) throw new Error("Failed to fetch admins");
        const data = await response.json();
        setAdmins(data);
      } catch (error) {
        console.error("Error fetching admins:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.email && isUserSuperAdmin(session.user.email, session.user.role)) {
      fetchAdmins();
    }
  }, [session]);

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      const response = await fetch("/api/superadmin/admins", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role: newRole }),
      });
      if (response.ok) {
        setAdmins(admins.map(a => a.id === id ? { ...a, role: newRole as any } : a));
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleDemote = async (id: string) => {
    if (!confirm("Are you sure you want to demote this admin?")) return;
    try {
       const response = await fetch(`/api/superadmin/admins?id=${id}`, {
         method: "DELETE",
       });
       if (response.ok) {
         setAdmins(admins.filter(a => a.id !== id));
       }
    } catch (error) {
      console.error("Error demoting admin:", error);
    }
  };

  const handleAddAdmin = async () => {
    try {
      const response = await fetch("/api/superadmin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail, role: "ADMIN" }),
      });
      if (response.ok) {
        alert("Success: Role Elevated");
        setShowAddModal(false);
        setNewAdminEmail("");
        const res = await fetch("/api/superadmin/admins");
        const data = await res.json();
        setAdmins(data);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to promote operative");
      }
    } catch (error) {
      console.error("Error adding admin:", error);
    }
  };

  if (loading && status !== "loading") {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-tighter text-white">
            Council <span className="text-purple-500">Hub</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Administrative clearance management</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-white hover:text-purple-600 text-white font-black uppercase tracking-widest px-8 py-6 rounded-2xl transition-all group shadow-lg shadow-purple-600/10"
        >
          <UserPlus className="mr-2 size-5 group-hover:scale-110 transition-transform" />
          Elevate Clearance
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.01] border-b border-white/5 text-left">
                <th className="px-8 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Operative</th>
                <th className="px-6 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Clearance Level</th>
                <th className="px-6 py-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-right text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Execution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {admins.map((admin) => (
                <tr key={admin.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                          <Shield className={`size-5 ${admin.role === 'SUPER_ADMIN' ? 'text-purple-400' : 'text-zinc-500'}`} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white leading-none uppercase">{admin.firstName} {admin.lastName}</p>
                          <p className="text-[10px] text-zinc-500 mt-1 font-mono tracking-tighter">{admin.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className={`px-3 py-1.5 rounded-xl border w-fit flex items-center gap-2 ${
                      admin.role === 'SUPER_ADMIN' 
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 font-black' 
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-bold'
                    }`}>
                       <Shield size={10} />
                       <span className="text-[10px] uppercase tracking-widest">{admin.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                     <div className="flex items-center gap-2">
                        <div className="size-1.5 rounded-full bg-green-500"></div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Active</span>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleUpdateRole(admin.id, admin.role === 'ADMIN' ? 'SUPER_ADMIN' : 'ADMIN')}
                         className="rounded-xl hover:bg-purple-500/10 text-zinc-500 hover:text-purple-400"
                       >
                          <ShieldCheck size={18} />
                       </Button>
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => handleDemote(admin.id)}
                         className="rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-500"
                       >
                          <Trash2 size={18} />
                       </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAddModal(false)}
               className="absolute inset-0 bg-black/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="relative bg-[#0A0A0B] border border-purple-500/20 rounded-[2.5rem] p-12 w-full max-w-md shadow-2xl"
             >
                <div className="space-y-8">
                   <div className="text-center space-y-2">
                      <div className="size-16 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
                         <Shield className="size-8 text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-white uppercase tracking-tighter">Draft Operative</h3>
                      <p className="text-zinc-500 text-sm font-medium">Elevate a missionary to the inner council.</p>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Secure Email</label>
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-600" />
                         <input 
                           type="email" 
                           placeholder="operative@rkade.in"
                           value={newAdminEmail}
                           onChange={(e) => setNewAdminEmail(e.target.value)}
                           className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all font-medium"
                         />
                      </div>
                   </div>

                   <div className="flex gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 border-white/5 bg-white/[0.03] text-zinc-500 py-6 rounded-2xl"
                      >
                        Abort
                      </Button>
                      <Button 
                        onClick={handleAddAdmin}
                        className="flex-1 bg-purple-600 hover:bg-white hover:text-purple-600 text-white font-black uppercase tracking-widest py-6 rounded-2xl shadow-lg shadow-purple-600/20"
                      >
                        Proceed
                      </Button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
