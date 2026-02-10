"use client";

import React from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SwipeToBook } from "@/components/ui/SwipeToBook";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: Record<string, string>;
  notes: Record<string, string>;
  handler: (response: any) => void;
}

interface WindowWithRazorpay extends Window {
  Razorpay?: {
    new(options: RazorpayOptions): {
      open: () => void;
    };
  };
}

type EventRow = {
  id: string;
  slug: string;
  event_name: string;
  landscape_poster: string | null;
  date: string | null;
  time: string | null;
  venue: string | null;
  price: string | null;
  category: string | null; // Added for Hackathon check
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default function BookEventPage({ params }: Props) {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [qty, setQty] = useState<number>(
    parseInt(searchParams.get("qty") || "1"),
  );
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<{name: string, phone: string, isLeader: boolean}[]>([
    {name: session?.user?.name || '', phone: '', isLeader: true}
  ]);

  // Sync team members with quantity
  useEffect(() => {
    setTeamMembers(prev => {
      if (prev.length === qty) return prev;
      const newMembers = [...prev];
      if (newMembers.length < qty) {
        for (let i = newMembers.length; i < qty; i++) {
          newMembers.push({ name: '', phone: '', isLeader: false });
        }
      } else {
        newMembers.splice(qty);
      }
      return newMembers;
    });
  }, [qty]);

  // Unwrap the params Promise
  const resolvedParams = React.use(params);

  // Countdown and redirect after success
  useEffect(() => {
    if (bookingSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (bookingSuccess && countdown === 0) {
      window.location.href = "/dashboard";
    }
  }, [bookingSuccess, countdown]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/events/slug/${resolvedParams.slug}`);
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const data = await res.json();
        if (!cancelled) setEvent(data as EventRow);
      } catch (error: unknown) {
        if (!cancelled)
          setError(
            error instanceof Error ? error.message : "Failed to load event",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [resolvedParams.slug]);

  const unitPrice = useMemo(() => {
    const p = event?.price ? parseFloat(event.price) : 0;
    return Number.isFinite(p) ? p : 0;
  }, [event?.price]);

  const totalPrice = useMemo(() => {
    return qty * unitPrice;
  }, [qty, unitPrice]);

  async function proceedToCheckout() {
    if (!event) return;
    setBookingLoading(true);
    setBookingError(null);

    // Validate Team Details for Hackathons
    if (event.category === "Hackathons" || event.category === "Hackathon") {
     if (!teamName.trim()) {
       setBookingError("Please enter a Team Name.");
       setBookingLoading(false);
       return;
     }

     const isFilled = teamMembers.every(m => m.name.trim() && m.phone.trim());
     if (!isFilled) {
       setBookingError("Please fill in Name and Mobile Number for all team members.");
       setBookingLoading(false);
       return;
     }
     
     const isPhoneValid = teamMembers.every(m => {
       const digits = m.phone.replace(/\D/g, "").trim();
       return /^[6-9]\d{9}$/.test(digits);
     });
     if (!isPhoneValid) {
        setBookingError("Please enter valid 10-digit Indian mobile numbers.");
        setBookingLoading(false);
        return;
     }

     const hasLeader = teamMembers.some(m => m.isLeader);
     if (!hasLeader) {
       setBookingError("Please designate a Team Leader.");
       setBookingLoading(false);
       return;
     }
    }

    const amountPaise = Math.round(totalPrice * 100);

    if (amountPaise <= 0) {
      // Free event: create booking directly
      try {
        const res = await fetch("/api/bookings/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: event.id,
            quantity: qty,
            amountPaise: 0,
            teamName: (event.category === "Hackathons" || event.category === "Hackathon") ? teamName : undefined,
            teamDetails: (event.category === "Hackathons" || event.category === "Hackathon") ? teamMembers : undefined,
          }),
        });
        const data = await res.json();
        if (data.booking) {
          setBookingSuccess(true);
          setBookingLoading(false);
        } else {
          // Check for authentication errors
          if (res.status === 401 || data.message === "Unauthorized") {
            setBookingError("login_required");
          } else {
            setBookingError(data.message || "Failed to create booking");
          }
          setBookingLoading(false);
        }
      } catch (err) {
        console.error(err);
        setBookingError("Failed to create booking");
        setBookingLoading(false);
      }
      return;
    }

    // Paid event: create booking then initiate payment
    try {
      const bookingRes = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          quantity: qty,
          amountPaise,
          teamName: (event.category === "Hackathons" || event.category === "Hackathon") ? teamName : undefined,
          teamDetails: (event.category === "Hackathons" || event.category === "Hackathon") ? teamMembers : undefined,
        }),
      });
      const bookingData = await bookingRes.json();

      if (!bookingData.booking) {
        // Check for authentication errors
        if (
          bookingRes.status === 401 ||
          bookingData.message === "Unauthorized"
        ) {
          setBookingError("login_required");
        } else {
          setBookingError(bookingData.message || "Failed to create booking");
        }
        setBookingLoading(false);
        return;
      }

      const orderRes = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt: `evt_${event.id}_${Date.now()}`,
          notes: { slug: event.slug, bookingId: bookingData.booking.id },
        }),
      });
      const { order, message } = await orderRes.json();

      if (!order) {
        setBookingError(message || "Failed to create order");
        setBookingLoading(false);
        return;
      }

      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string | undefined;
      if (!key) {
        setBookingError("Razorpay key not configured");
        setBookingLoading(false);
        return;
      }

      await loadRazorScript();

      const options: RazorpayOptions = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: event.event_name || (event as any).eventName,
        description: `Tickets x${qty}`,
        order_id: order.id,
        prefill: {},
        notes: { slug: event.slug, bookingId: bookingData.booking.id },
        handler: async function (response: any) {
          try {
            await fetch("/api/bookings/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: bookingData.booking.id,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
              }),
            });
            setBookingSuccess(true);
            setBookingLoading(false);
          } catch (err) {
            console.error(err);
            setBookingError(
              "Payment succeeded but confirmation failed. Contact support.",
            );
            setBookingLoading(false);
          }
        },
      };

      const Razorpay = (window as WindowWithRazorpay).Razorpay;
      if (!Razorpay) throw new Error("Razorpay not loaded");
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setBookingError("Failed to start checkout");
      setBookingLoading(false);
    }
  }

  function loadRazorScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as WindowWithRazorpay).Razorpay) return resolve();
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Razorpay"));
      document.body.appendChild(s);
    });
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-obsidian via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-acid border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 font-mono uppercase tracking-widest animate-pulse">
            Loading event...
          </p>
        </div>
      </div>
    );
  }
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-obsidian via-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-500 text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-white">Event Not Found</h2>
          <p className="text-gray-400">
            {error || "The event you're looking for doesn't exist."}
          </p>
          <Link
            href="/events"
            className="inline-block bg-acid hover:bg-acid-hover text-black font-bold py-3 px-6 rounded-xl transition-all"
          >
            Browse All Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-obsidian via-gray-900 to-black text-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Login Required Banner (shown at top if not authenticated) */}
        {status === "unauthenticated" && !bookingError && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-amber-200 text-sm font-medium">
                  You'll need to sign in to complete your booking
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {bookingSuccess && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md font-display">
            <div className="bg-[#0D0D0D] border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full text-center space-y-8 shadow-[0_0_50px_-12px_rgba(182,255,0,0.2)] animate-in zoom-in-95 fade-in duration-500 relative overflow-hidden">
              {/* Decorative Background Element */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-acid/10 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative">
                <div className="w-24 h-24 bg-acid/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-acid/20 shadow-[0_0_30px_-5px_rgba(182,255,0,0.3)]">
                  <svg
                    className="w-12 h-12 text-acid"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <div className="space-y-3">
                  <h2 className="text-4xl font-bold uppercase italic tracking-tighter text-white">
                    Booking <span className="text-acid">Success</span>
                  </h2>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed px-4">
                    Your spot for <span className="text-white font-bold italic">{event.event_name || (event as any).eventName}</span> has been secured. Get ready for the experience!
                  </p>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 space-y-4 text-sm relative">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  <span>Quantity</span>
                  <span className="text-white tracking-normal normal-case text-base">
                    {qty} {qty > 1 ? "Tickets" : "Ticket"}
                  </span>
                </div>
                <div className="h-px bg-white/5"></div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  <span>Total Paid</span>
                  <span className="text-acid tracking-normal normal-case text-lg font-bold">
                    {totalPrice <= 0 ? "FREE" : `₹${totalPrice.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="space-y-6 relative">
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-black">Redirecting In</div>
                  <div className="text-3xl font-bold text-white/50 relative">
                    <span className="relative z-10">{countdown}</span>
                    <div className="absolute inset-0 bg-acid/20 blur-xl rounded-full"></div>
                  </div>
                </div>
                
                <Link
                  href="/dashboard"
                  className="group relative block w-full"
                >
                  <div className="absolute inset-0 bg-acid blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl"></div>
                  <div className="relative bg-acid hover:bg-white text-black font-black uppercase tracking-widest py-4 px-6 rounded-2xl transition-all duration-300 transform active:scale-[0.98] text-sm italic">
                    View My Bookings
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Booking Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Event Header */}
          <div className="relative overflow-hidden h-auto">
            <div className="relative left-0 right-0 p-6 md:p-8">
              <Link
                href={`/events/${event.slug}`}
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to event
              </Link>
              <h1 className="text-3xl md:text-4xl font-display font-bold uppercase italic leading-tight">
                {event.event_name || (event as any).eventName}
              </h1>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-300">
                {event.date && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {new Date(event.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {event.time && ` • ${event.time}`}
                  </div>
                )}
                {event.venue && (
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {event.venue}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="px-6 pb-6 pt-0 md:px-8 md:pb-8 md:pt-4 space-y-6">
            {/* Quantity Selector */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="qty" className="font-semibold text-lg">
                  {(event.category === "Hackathons" || event.category === "Hackathon") ? "Team Size" : "Number of Tickets"}
                </label>
                <div className="flex items-center gap-3 bg-black/40 rounded-xl p-2 border border-white/10">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xl font-bold"
                    disabled={bookingLoading}
                  >
                    −
                  </button>
                  <input
                    id="qty"
                    type="number"
                    min={1}
                    max={5}
                    value={qty}
                    onChange={(e) =>
                      setQty(
                        Math.max(1, Math.min(5, Number(e.target.value) || 1)),
                      )
                    }
                    className="w-16 bg-transparent text-center font-mono text-xl font-bold text-white outline-none"
                    disabled={bookingLoading}
                  />
                  <button
                    onClick={() => setQty(Math.min(5, qty + 1))}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors text-xl font-bold"
                    disabled={bookingLoading}
                  >
                    +
                  </button>
                </div>
              </div>
              {(event.category === "Hackathons" || event.category === "Hackathon") && (
                <p className="text-xs text-zinc-500 text-right italic">Maximum 5 members per team</p>
              )}
            </div>

            {/* Team Details Inputs */}
            {(event.category === "Hackathons" || event.category === "Hackathon") && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Team Identity</h3>
                  <div className="space-y-2">
                    <label className="block text-xs text-gray-500 uppercase font-black tracking-widest">Team Name</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-acid outline-none transition-colors"
                      placeholder="Enter your squad's name"
                    />
                  </div>
                </div>

                <div className="h-px bg-white/5"></div>

                <div>
                  <h3 className="font-semibold text-lg mb-4">Operative Personnel</h3>
                  <div className="space-y-4">
                    {teamMembers.map((member, idx) => (
                      <div key={idx} className={`p-5 rounded-2xl border transition-all ${member.isLeader ? 'bg-acid/5 border-acid/20 ring-1 ring-acid/10' : 'bg-black/20 border-white/5'} space-y-4`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Operative {idx + 1}</p>
                            {member.isLeader && (
                              <span className="text-[10px] bg-acid text-black font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Team Leader</span>
                            )}
                          </div>
                          {!member.isLeader && (
                            <button 
                              onClick={() => {
                                setTeamMembers(teamMembers.map((m, i) => ({
                                  ...m,
                                  isLeader: i === idx
                                })));
                              }}
                              className="text-[10px] font-black text-zinc-500 hover:text-acid transition-colors uppercase tracking-widest"
                            >
                              Set as Leader
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                             <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                             <input
                               type="text"
                               value={member.name}
                               onChange={(e) => {
                                 const newMembers = [...teamMembers];
                                 newMembers[idx].name = e.target.value;
                                 setTeamMembers(newMembers);
                               }}
                               className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:border-acid outline-none transition-colors"
                               placeholder="Enter full name"
                             />
                          </div>
                          <div>
                             <label className="block text-xs text-gray-500 mb-1">Mobile Number</label>
                             <div className="flex">
                               <span className="flex items-center px-3 bg-white/10 border border-r-0 border-white/10 rounded-l-xl text-zinc-400 text-sm font-mono">+91</span>
                               <input
                                 type="text"
                                 value={member.phone}
                                 onChange={(e) => {
                                   const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                                   const newMembers = [...teamMembers];
                                   newMembers[idx].phone = val;
                                   setTeamMembers(newMembers);
                                 }}
                                 className="w-full bg-white/5 border border-white/10 rounded-r-xl px-3 py-2.5 text-white placeholder-gray-600 focus:border-acid outline-none transition-colors font-mono"
                                 placeholder="10-digit number"
                               />
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-lg mb-4">Price Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Price per ticket</span>
                  <span className="font-mono">{unitPrice <= 0 ? "FREE" : `₹${unitPrice.toFixed(2)}`}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Quantity</span>
                  <span className="font-mono">× {qty}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="text-acid font-mono">
                    {totalPrice <= 0 ? "FREE" : `₹${totalPrice.toFixed(2)}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Error/Login Message */}
            {bookingError && bookingError === "login_required" ? (
              <div className="bg-gradient-to-r from-acid/10 to-yellow-500/10 border border-acid/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-acid/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-acid"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-acid mb-2">
                      Please Login to Book Tickets
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      You need to be signed in to book tickets for this event.
                      Create an account or login to continue.
                    </p>
                    <div className="flex gap-3">
                      <Link
                        href={`/auth/signin?callbackUrl=/events/${event?.slug}/book?qty=${qty}`}
                        className="inline-flex items-center gap-2 bg-acid hover:bg-acid-hover text-black font-bold py-2.5 px-5 rounded-lg transition-all"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                          />
                        </svg>
                        Sign In
                      </Link>
                      <Link
                        href={`/auth/signup?callbackUrl=/events/${event?.slug}/book?qty=${qty}`}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 px-5 rounded-lg border border-white/20 transition-all"
                      >
                        Create Account
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : bookingError ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <span className="text-red-500 text-xl">⚠️</span>
                <p className="text-red-400 text-sm flex-1">{bookingError}</p>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Mobile: Swipe to Book Slider */}
              <div className="md:hidden">
                <SwipeToBook
                  onComplete={proceedToCheckout}
                  disabled={bookingLoading}
                  price={totalPrice}
                  isFree={totalPrice === 0}
                  isLoading={bookingLoading}
                />
              </div>

              {/* Desktop: Standard Button */}
              <Button
                type="button"
                className="hidden md:flex w-full bg-acid hover:bg-acid-hover text-black font-bold py-4 rounded-xl text-lg uppercase tracking-wide transition-all shadow-lg shadow-acid/20 hover:shadow-acid/40 disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-3"
                onClick={proceedToCheckout}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : totalPrice === 0 ? (
                  <>
                    <span>Confirm Booking</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    <span>Proceed to Payment</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </>
                )}
              </Button>

              <div className="text-center text-xs text-gray-500">
                🔒 Secure payment powered by Razorpay
              </div>
            </div>
          </div>
        </div>

            {/* Info Cards removed as per request */}
      </div>
    </div>
  );
}
