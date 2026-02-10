"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import QRCode from "react-qr-code";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

interface BookingEvent {
  event_name?: string;
  eventName?: string;
  date?: string;
  time?: string;
  landscape_poster?: string;
  portrait_poster?: string;
  venue?: string;
}

interface Booking {
  id: string;
  qrCode?: string;
  qrCodeToken?: string;
  status: string;
  userEmail: string;
  event?: BookingEvent;
  createdAt?: string;
  created_at?: string;
}

export default function BookingsSquare() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/bookings/user");
        if (response.ok) {
          const data = await response.json();
          // Get latest bookings/tickets
          const latestBookings = Array.isArray(data) ? data : [];
          setBookings(latestBookings);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [session]);

  const nextBooking = () => {
    setCurrentIndex((prev) => (prev + 1) % bookings.length);
  };

  const prevBooking = () => {
    setCurrentIndex((prev) => (prev - 1 + bookings.length) % bookings.length);
  };

  const getEventName = (event?: BookingEvent): string => {
    if (!event) return "Event";
    return event.event_name || event.eventName || "Event";
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Date TBA";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[280px] rounded-3xl bg-white/5 animate-pulse border border-white/10" />
    );
  }

  if (!session || bookings.length === 0) {
    // Show a placeholder ticket encouraging login or booking
    return (
      <div className="relative w-full h-full min-h-[160px] flex items-center justify-center">
        <div className="text-center py-3 px-4 md:bg-glass md:border md:border-white/10 md:rounded-2xl">
          <h3 className="text-white font-bold mb-2">{!session ? "Login to View Tickets" : "No Tickets Yet"}</h3>
          <Link href={!session ? "/auth/signin" : "/events"} className="bg-acid text-black px-4 py-2 rounded-full text-sm font-bold uppercase">
            {!session ? "Login Now" : "Browse Events"}
          </Link>
        </div>
      </div>
    );
  }

  const currentBooking = bookings[currentIndex];
  const event = currentBooking.event;
  const qrValue = currentBooking.qrCodeToken || currentBooking.qrCode || currentBooking.id;

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <div className="relative flex w-full max-w-[500px] h-[260px] rounded-3xl overflow-hidden shadow-2xl">

        {/* LEFT SIDE (Dark) */}
        <div className="flex-1 bg-[#0a0a0a] relative p-4 flex flex-col justify-between border-r-2 border-dashed border-white/10 overflow-hidden">
          {/* Top Cutout */}
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-transparent rounded-full z-20"></div>
          {/* Bottom Cutout */}
          <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-transparent rounded-full z-20"></div>

          {/* Event Info */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase leading-none mb-4 line-clamp-2 mt-2">
              {getEventName(event)}
            </h2>
          </div>

          {/* Details Grid */}
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-lime-400/10 flex items-center justify-center text-lime-400">
                <Calendar size={14} />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Date</p>
                <p className="text-xs text-white font-bold">{formatDate(event?.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Clock size={14} />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Time</p>
                <p className="text-xs text-white font-bold">{event?.time || "TBA"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                <MapPin size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Venue</p>
                <p className="text-xs text-white font-bold truncate">{event?.venue || "TBA"}</p>
              </div>
            </div>
          </div>

          {/* Navigation Buttons (Bottom Right of Left Panel) */}
          {bookings.length > 1 && (
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={(e) => { e.stopPropagation(); prevBooking(); }} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); nextBooking(); }} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT SIDE (White) */}
        <div className="w-[140px] sm:w-[160px] bg-white text-black flex flex-col items-center justify-center p-3 relative">
          {/* Top Cutout */}
          <div className="absolute -top-3 -left-3 w-6 h-6 bg-black rounded-full z-20"></div>
          {/* Bottom Cutout */}
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-black rounded-full z-20"></div>

          <div className="w-full aspect-square bg-black border-4 border-black mb-2">
            <div className="bg-white p-1 w-full h-full">
              <QRCode
                value={qrValue}
                size={256}
                style={{ height: "100%", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            </div>
          </div>

          <div className="text-center">
            <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mb-1">Ticket ID</p>
            <p className="text-xs font-mono font-bold tracking-tighter truncate max-w-[120px]">{currentBooking.id.slice(0, 8).toUpperCase()}</p>
          </div>


        </div>

      </div>

      {/* Footer/Indicators */}
      {bookings.length > 1 && (
        <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-1">
          {bookings.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-4 bg-acid' : 'w-1.5 bg-white/20'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
