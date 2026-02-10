"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Globe, 
  Save,
  Wrench,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemSettings {
  platformName: string;
  supportEmail: string;
  footerText: string;
  maintenanceMode: boolean;
  instagram: string;
  twitter: string;
  linkedin: string;
}

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    platformName: "",
    supportEmail: "",
    footerText: "",
    maintenanceMode: false,
    instagram: "",
    twitter: "",
    linkedin: ""
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        alert("System configuration synchronized.");
      } else {
        alert("Failed to synchronize configuration.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-acid border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-display font-bold uppercase tracking-tighter text-white">
             System <span className="text-acid">Settings</span>
           </h1>
           <p className="text-zinc-500 font-medium mt-1">Configure global platform parameters and infrastructure.</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-acid hover:bg-white text-black font-black uppercase tracking-widest px-10 py-6 rounded-2xl transition-all shadow-lg shadow-acid/10"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
               <div className="size-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
               Syncing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
               <Save size={18} />
               Save Changes
            </div>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         <div className="lg:col-span-3 space-y-2">
            <button className="w-full text-left px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-acid/10 text-acid border border-acid/20">
              General Control
            </button>
            <p className="px-6 py-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              More protocols coming soon
            </p>
         </div>

         <div className="lg:col-span-9 space-y-10">
            <div className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${
              settings.maintenanceMode 
                ? "bg-red-500/10 border-red-500/30" 
                : "bg-white/[0.03] border-white/5"
            } flex flex-col md:flex-row items-center justify-between gap-6`}>
               <div className="flex items-center gap-6">
                  <div className={`size-16 rounded-[2rem] flex items-center justify-center transition-colors ${
                    settings.maintenanceMode ? "bg-red-500/20 text-red-500" : "bg-white/5 text-zinc-500"
                  }`}>
                     <Wrench size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-display font-bold text-white uppercase">Maintenance Mode</h3>
                     <p className="text-xs text-zinc-500 font-medium max-w-md">Override platform access and display a service window. This will disconnect all non-admin users instantly.</p>
                  </div>
               </div>
               <button 
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`relative w-20 h-10 rounded-full transition-colors duration-300 ${settings.maintenanceMode ? "bg-red-500" : "bg-zinc-800"}`}
               >
                  <div className={`absolute top-1 left-1 size-8 rounded-full bg-white shadow-lg transition-all duration-300 ${settings.maintenanceMode ? "translate-x-10" : "translate-x-0"}`} />
               </button>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 space-y-8"
            >
               <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="p-3 rounded-2xl bg-white/5 text-acid">
                    <Globe className="size-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white uppercase">Platform Identity</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Platform Name</label>
                     <input 
                       type="text" 
                       value={settings.platformName}
                       onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                       className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-acid/30 transition-all font-medium"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Support Email</label>
                     <input 
                       type="text" 
                       value={settings.supportEmail}
                       onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                       className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-acid/30 transition-all font-medium"
                     />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Global Footer Text</label>
                     <input 
                       type="text" 
                       value={settings.footerText}
                       onChange={(e) => setSettings({...settings, footerText: e.target.value})}
                       className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-acid/30 transition-all font-medium"
                     />
                  </div>
               </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-10 space-y-8"
            >
               <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="p-3 rounded-2xl bg-white/5 text-acid">
                    <LinkIcon className="size-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white uppercase">Network Links</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Instagram</label>
                     <input 
                       type="text" 
                       value={settings.instagram}
                       onChange={(e) => setSettings({...settings, instagram: e.target.value})}
                       className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-acid/30 transition-all font-medium"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Twitter</label>
                     <input 
                       type="text" 
                       value={settings.twitter}
                       onChange={(e) => setSettings({...settings, twitter: e.target.value})}
                       className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-acid/30 transition-all font-medium"
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">LinkedIn</label>
                     <input 
                       type="text" 
                       value={settings.linkedin}
                       onChange={(e) => setSettings({...settings, linkedin: e.target.value})}
                       className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-acid/30 transition-all font-medium"
                     />
                  </div>
               </div>
            </motion.div>
         </div>
      </div>
    </div>
  );
}
