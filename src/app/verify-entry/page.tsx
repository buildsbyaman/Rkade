"use client";

import { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  QrCode, 
  Camera, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert,
  User,
  Calendar,
  MapPin,
  Clock,
  Zap,
  ChevronRight,
  Maximize2
} from "lucide-react";
import { isUserAdmin } from "@/lib/admin-auth";

interface VerificationResult {
  verified: boolean;
  genuine: boolean;
  alreadyScanned?: boolean;
  data?: {
    bookingId: string;
    userName: string;
    eventName: string;
    eventDate: string;
    eventVenue: string;
    scannedAt?: string;
    scannedBy?: string;
  };
  message?: string;
  error?: string;
}

export default function VerifyEntry() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [qrInput, setQrInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "found">("idle");

  useEffect(() => {
    if (isCameraActive) {
      scanQR();
    }
  }, [isCameraActive]);

  const scanQR = () => {
    if (!videoRef.current || !isCameraActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      canvas.height = videoRef.current.videoHeight;
      canvas.width = videoRef.current.videoWidth;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code) {
        setScanStatus("found");
        verifyToken(code.data);
        stopCamera();
        return;
      }
    }
    requestAnimationFrame(scanQR);
  };

  const verifyToken = async (token: string) => {
    if (!token.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch("/api/bookings/verify-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCodeToken: token.trim() }),
      });
      const result = await response.json();
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({
        verified: false,
        genuine: false,
        error: "Connection encrypted but verification failed. Check link.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setScanStatus("scanning");
      }
    } catch (err) {
      alert("Camera access denied. Please use manual entry.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
      setIsCameraActive(false);
      setScanStatus("idle");
    }
  };

  if (status === "loading") return null;
  if (!session || !isUserAdmin(session.user?.email)) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-display font-bold uppercase italic tracking-tighter text-white">
             Entry <span className="text-acid">Validator</span>
           </h1>
           <p className="text-zinc-500 font-medium mt-1 text-sm">Scan attendee QR codes for high-speed entrance processing.</p>
        </div>
        <div className="flex bg-white/[0.03] border border-white/5 p-1 rounded-2xl">
           <Button 
            variant="ghost" 
            className="rounded-xl px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white"
          >
            History
          </Button>
           <Button 
            variant="ghost" 
            className="rounded-xl px-6 text-[10px] font-black uppercase tracking-widest text-acid bg-acid/10 border border-acid/10"
          >
            Active Scanner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Scanner Column */}
        <div className="lg:col-span-12 space-y-8">
           <div className="relative aspect-video md:aspect-[21/9] bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-white/5 group shadow-2xl">
              {!isCameraActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                   <div className="size-24 rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <Camera className="size-10 text-zinc-600" />
                   </div>
                   <div className="text-center space-y-2">
                      <h3 className="text-xl font-display font-bold text-white uppercase italic tracking-tight">Camera Is Standby</h3>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Connect optics to start scanning</p>
                   </div>
                   <Button 
                    onClick={startCamera}
                    className="bg-acid hover:bg-white text-black font-black uppercase tracking-widest px-10 py-6 rounded-2xl transition-all shadow-lg shadow-acid/10"
                   >
                     Initialize Optics
                   </Button>
                </div>
              ) : (
                <div className="absolute inset-0">
                   <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale opacity-60" />
                   <canvas ref={canvasRef} className="hidden" />
                   
                   {/* HUD Overlays */}
                   <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
                   
                   {/* Scanning Box */}
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="size-64 md:size-80 relative">
                         <div className="absolute top-0 left-0 size-8 border-t-4 border-l-4 border-acid rounded-tl-3xl"></div>
                         <div className="absolute top-0 right-0 size-8 border-t-4 border-r-4 border-acid rounded-tr-3xl"></div>
                         <div className="absolute bottom-0 left-0 size-8 border-b-4 border-l-4 border-acid rounded-bl-3xl"></div>
                         <div className="absolute bottom-0 right-0 size-8 border-b-4 border-r-4 border-acid rounded-br-3xl"></div>
                         
                         <motion.div 
                           animate={{ y: [0, 256, 0] }}
                           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                           className="absolute left-0 right-0 h-1 bg-acid/20 blur-sm shadow-[0_0_15px_rgba(204,255,0,0.5)]" 
                         />
                      </div>
                   </div>

                   <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
                      <div className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                         <div className="size-2 rounded-full bg-red-500 animate-pulse"></div>
                         <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Feed</span>
                      </div>
                      <button 
                        onClick={stopCamera}
                        className="size-10 rounded-full bg-red-500 flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                         <X size={20} />
                      </button>
                   </div>
                </div>
              )}
           </div>

           {/* Manual Input Toggle */}
           <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-3xl p-8 space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-acid">
                       <Zap size={16} />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-white">Manual Core Injection</h4>
                 </div>
                 <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Paste secure token or booking hash..." 
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      className="flex-1 bg-black/20 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-acid/30 transition-all font-mono"
                    />
                    <Button 
                      onClick={() => verifyToken(qrInput)}
                      disabled={isVerifying || !qrInput}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest px-8 rounded-2xl border border-white/5"
                    >
                      {isVerifying ? "..." : "Verify"}
                    </Button>
                 </div>
              </div>

              <div className="md:w-64 bg-white/[0.03] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-white/5 transition-colors">
                  <Upload className="size-8 text-zinc-600 mb-4 group-hover:text-acid transition-colors" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Static Image Scan</p>
                  <input type="file" className="hidden" />
              </div>
           </div>
        </div>

        {/* Results Backdrop */}
        <AnimatePresence>
           {(verificationResult || isVerifying) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="lg:col-span-12"
              >
                  <div className={`rounded-[2.5rem] border p-8 md:p-12 relative overflow-hidden ${
                    isVerifying ? "bg-white/[0.03] border-white/5" :
                    verificationResult?.verified && verificationResult?.genuine ? "bg-green-500/5 border-green-500/20" : 
                    "bg-red-500/5 border-red-500/20"
                  }`}>
                     
                     {isVerifying ? (
                       <div className="flex flex-col items-center justify-center py-20 space-y-6">
                           <div className="size-20 border-4 border-acid border-t-zinc-800 rounded-full animate-spin"></div>
                           <p className="text-sm text-zinc-500 font-bold uppercase tracking-[0.3em] animate-pulse">Decrypting Security Layer</p>
                       </div>
                     ) : verificationResult?.verified && verificationResult?.genuine ? (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                           <div className="md:col-span-4 flex flex-col items-center text-center space-y-6">
                              <div className="size-32 rounded-full bg-green-400/10 border-4 border-green-400 flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.2)]">
                                 <CheckCircle2 size={64} className="text-green-400" />
                              </div>
                              <div>
                                 <h2 className="text-3xl font-display font-bold text-white uppercase italic tracking-tighter">Verified Access</h2>
                                 <p className="text-xs text-green-400 font-black uppercase tracking-widest mt-1">Identity Confirmed</p>
                              </div>
                              {verificationResult.alreadyScanned && (
                                <div className="px-4 py-2 bg-yellow-400/10 border border-yellow-400/40 rounded-xl">
                                   <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Duplication Detected</p>
                                </div>
                              )}
                           </div>

                           <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 p-8 bg-black/20 rounded-[2rem] border border-white/5">
                              <div className="sm:col-span-2 flex items-center gap-4 pb-4 border-b border-white/5">
                                 <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center">
                                    <User className="size-6 text-zinc-400" />
                                 </div>
                                 <div>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Participant</p>
                                    <p className="text-2xl font-display font-bold text-white uppercase italic">{verificationResult.data?.userName}</p>
                                 </div>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mission/Event</p>
                                 <p className="text-white font-bold">{verificationResult.data?.eventName}</p>
                              </div>
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Field Location</p>
                                 <p className="text-white font-bold">{verificationResult.data?.eventVenue}</p>
                              </div>
                              <div className="sm:col-span-2 pt-4">
                                 <div className="w-full h-px bg-white/5 mb-4"></div>
                                 <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                    <span>Time: {new Date().toLocaleTimeString()}</span>
                                    <span>Ops: {session.user?.name?.split(" ")[0]}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center text-center space-y-6 py-10">
                           <div className="size-32 rounded-full bg-red-400/5 border-4 border-red-500 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                              <ShieldAlert size={64} className="text-red-500" />
                           </div>
                           <div className="max-w-md space-y-2">
                              <h2 className="text-3xl font-display font-bold text-white uppercase italic tracking-tighter">Access Denied</h2>
                              <p className="text-red-400 font-bold uppercase text-xs tracking-widest">{verificationResult?.error || "Invalid Security Token"}</p>
                              <p className="text-zinc-500 text-sm font-medium mt-4 leading-relaxed">
                                The provided QR signature does not match any registered mission deployments. Check for signal interference or identity spoofing.
                              </p>
                           </div>
                           <Button 
                             onClick={() => setVerificationResult(null)}
                             className="bg-white/5 hover:bg-white/10 text-white rounded-xl px-10 border border-white/10"
                           >
                              Reset Scanner
                           </Button>
                        </div>
                     )}
                  </div>
              </motion.div>
           )}
        </AnimatePresence>
      </div>
    </div>
  );
}
