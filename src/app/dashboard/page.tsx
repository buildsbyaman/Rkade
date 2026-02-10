"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import QRCode from "react-qr-code";
import { Event, Booking } from "@/types/event";
import { isUserAdmin } from "@/lib/admin-auth";
import { canAccessStaffRoutes } from "@/lib/staff-auth";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { useToast } from "../../hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [qrCodeToken, setQrCodeToken] = useState<string | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const handleDownloadQR = (bookingId: string, qrCode: string) => {
    const svg = document.getElementById(`qr-${bookingId}`);
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = document.createElement("img");

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `ticket-${bookingId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const generateQRCodeToken = async (bookingId: string) => {
    // Check if QR already exists
    if (selectedBooking?.qrCodeToken) {
      setQrCodeToken(selectedBooking.qrCodeToken);
      toast({
        title: "QR Code Already Exists",
        description: "This booking already has a generated QR code",
      });
      return;
    }

    setIsGeneratingQR(true);
    try {
      const response = await fetch("/api/bookings/generate-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const data = await response.json();
      setQrCodeToken(data.qrCodeToken);

      // Update the selected booking with the new token
      if (selectedBooking) {
        setSelectedBooking({
          ...selectedBooking,
          qrCodeToken: data.qrCodeToken,
        });
      }

      const message = data.alreadyExists
        ? "QR code already exists for this booking"
        : "QR code generated successfully";

      toast({
        title: data.alreadyExists ? "QR Code Retrieved" : "Success",
        description: message,
      });
    } catch (error) {
      // ...existing code...
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Load existing QR code when booking details modal opens
  useEffect(() => {
    if (selectedBooking && showBookingDetails && selectedBooking.qrCodeToken) {
      setQrCodeToken(selectedBooking.qrCodeToken);
    } else if (!showBookingDetails) {
      // Reset when modal closes
      setQrCodeToken(null);
    }
  }, [showBookingDetails, selectedBooking]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/auth/signin");

    const fetchUserData = async () => {
      try {
        const eventsRes = await fetch("/api/events/user");
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          // ...existing code...
          setUserEvents(Array.isArray(eventsData) ? eventsData : []);
        } else {
          // ...existing code...
        }

        const bookingsRes = await fetch("/api/bookings/user");
        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          // ...existing code...
          setUserBookings(Array.isArray(bookingsData) ? bookingsData : []);
        } else {
          // ...existing code...
        }
      } catch (error) {
        // ...existing code...
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [session, status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const formatBookingDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const formatEventDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "TBA";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString || "TBA";
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-white py-12 px-4 sm:px-6 lg:px-8 bg-noise">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-white">
            Dashboard
          </h1>
          <p className="text-zinc-400">Welcome back, {session.user?.name}!</p>
        </div>

        <div
          className={`grid grid-cols-1 ${isUserAdmin(session.user?.email) ? "lg:grid-cols-3" : "lg:grid-cols-2"} gap-8 items-start`}
        >
          {/* Admin Panel Card - Only for Admins */}
          {isUserAdmin(session.user?.email) && (
            <Card className="bg-glass border-acid/30 text-white h-fit shadow-2xl rounded-2xl">
              <CardHeader className="pb-0">
                <CardTitle className="text-acid text-2xl font-extrabold tracking-tight flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-acid">
                    admin_panel_settings
                  </span>
                  Admin Panel
                </CardTitle>
                <CardDescription className="text-zinc-400 mt-2">
                  Access exclusive admin features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 mt-4">
                  <Link href="/admin/events" className="w-full">
                    <Button className="w-full bg-acid text-black hover:bg-acid-hover font-bold py-4 text-lg rounded-xl shadow-md transition-all">
                      <span className="material-symbols-outlined mr-2 text-2xl">
                        event
                      </span>
                      Manage Events
                    </Button>
                  </Link>
                  <Link href="/admin/verify" className="w-full">
                    <Button className="w-full bg-electric-purple text-white hover:bg-electric-purple/80 font-bold py-4 text-lg rounded-xl shadow-md transition-all">
                      <span className="material-symbols-outlined mr-2 text-2xl">
                        verified
                      </span>
                      Verify Entries
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
          {/* Your Events Card */}
          <Card className="bg-glass border-white/10 text-white h-fit">
            <CardHeader>
              <CardTitle className="text-white">Your Events</CardTitle>
              <CardDescription className="text-zinc-400">
                Events you have created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {userEvents.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
                    <p className="text-zinc-500 mb-4">
                      You haven&apos;t created any events yet.
                    </p>
                    <Link href="/events/create">
                      <Button
                        variant="outline"
                        className="border-electric-purple text-electric-purple hover:bg-electric-purple/10"
                      >
                        Create New Event
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userEvents.map((event: Event, index: number) => (
                      <EventCard
                        key={event.id}
                        title={event.event_name || (event as any).eventName}
                        slug={event.slug || event.id}
                        image={event.landscape_poster || (event as any).landscapePoster || event.portrait_poster || (event as any).portraitPoster || "/Assests/1.jpg"}
                        date={event.date}
                        category={event.category || "Event"}
                        location={event.venue}
                        price={event.price}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Bookings Card */}
          <Card className="bg-glass border-white/10 text-white h-fit">
            <CardHeader>
              <CardTitle className="text-white">My Bookings</CardTitle>
              <CardDescription className="text-zinc-400">
                Events you have booked
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {userBookings.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
                    <p className="text-zinc-500 mb-4">
                      You haven&apos;t booked any events yet.
                    </p>
                    <Link href="/events">
                      <Button
                        variant="outline"
                        className="border-electric-purple text-electric-purple hover:bg-electric-purple/10"
                      >
                        Browse Events
                      </Button>
                    </Link>
                  </div>
                ) : (
                  userBookings.map((booking: Booking) => (
                    <div
                      key={booking.id}
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowBookingDetails(true);
                      }}
                      className="p-5 border border-white/10 rounded-xl hover:border-acid/50 hover:bg-white/5 transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2 text-white">
                            {booking.event?.event_name || (booking.event as any)?.eventName || "Event Name"}
                          </h3>
                          <div className="text-sm text-zinc-400 flex items-center gap-2">
                            <span className="material-symbols-outlined text-acid text-base">
                              calendar_today
                            </span>
                            <p>{formatEventDate(booking.event?.date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const eventId = (booking as any).eventId || booking.event_id || (booking.event as any)?._id;
                              if (eventId) router.push(`/community/${eventId}`);
                            }}
                            className="text-xs bg-electric-purple/10 text-electric-purple px-2 py-1 rounded-md border border-electric-purple/20 hover:bg-electric-purple/20 transition-colors flex items-center gap-1"
                            title="Event Community"
                          >
                            <span className="material-symbols-outlined text-sm">forum</span>
                            Community
                          </button>
                          <div className="text-xs bg-acid/10 text-acid px-2 py-1 rounded-md border border-acid/20">
                            Booked
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Details Modal */}
        <Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails}>
          <DialogContent className="bg-obsidian border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-acid">
                Booking Details
              </DialogTitle>
            </DialogHeader>

            {selectedBooking && (
              <div className="space-y-6">
                {/* QR Code Section */}
                <div className="glass-card p-6 rounded-xl border-white/10 bg-white/5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-acid">
                      qr_code_2
                    </span>
                    Entry QR Code
                  </h3>

                  <div className="flex flex-col items-center gap-4">
                    {qrCodeToken ? (
                      <>
                        <div className="bg-white p-4 rounded-lg">
                          <QRCode
                            id={`qr-${selectedBooking.id}`}
                            value={qrCodeToken}
                            size={256}
                            level="H"
                            style={{
                              height: "auto",
                              maxWidth: "100%",
                              width: "100%",
                            }}
                          />
                        </div>
                        <div className="text-center w-full">
                          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                            QR Code Token
                          </p>
                          <p className="font-mono text-xs text-white bg-white/5 px-3 py-2 rounded break-all">
                            {qrCodeToken}
                          </p>
                        </div>
                        <p className="text-xs text-green-400 flex items-center gap-1 mt-2">
                          <span className="material-symbols-outlined text-sm">
                            check_circle
                          </span>
                          Successfully Generated
                        </p>
                      </>
                    ) : (
                      <Button
                        onClick={() => generateQRCodeToken(selectedBooking.id)}
                        disabled={isGeneratingQR}
                        className="bg-acid text-black hover:bg-acid-hover font-bold w-full"
                      >
                        {isGeneratingQR ? (
                          <>
                            <span className="material-symbols-outlined mr-2 animate-spin">
                              refresh
                            </span>
                            Generating QR Code...
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined mr-2">
                              qr_code_2
                            </span>
                            Generate QR Code
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Event Information */}
                <div className="glass-card p-6 rounded-xl border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-acid">
                      confirmation_number
                    </span>
                    Event Information
                  </h3>

                  {(selectedBooking.event?.landscape_poster || (selectedBooking.event as any)?.landscapePoster) && (
                    <div className="w-full h-48 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={selectedBooking.event.landscape_poster || (selectedBooking.event as any).landscapePoster}
                        alt={selectedBooking.event.event_name || (selectedBooking.event as any).eventName || "Event"}
                        width={600}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wide">
                        Event Name
                      </p>
                      <p className="text-lg font-semibold text-white">
                        {selectedBooking.event?.event_name || (selectedBooking.event as any)?.eventName || "Event Name"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                          Date
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-acid text-sm">
                            calendar_today
                          </span>
                          <p className="text-sm text-zinc-300">
                            {formatEventDate(selectedBooking.event?.date)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                          Time
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-acid text-sm">
                            schedule
                          </span>
                          <p className="text-sm text-zinc-300">
                            {selectedBooking.event?.time || "TBA"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                        Venue
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-acid text-sm">
                          location_on
                        </span>
                        <p className="text-sm text-zinc-300">
                          {selectedBooking.event?.venue || "TBA"}
                        </p>
                      </div>
                    </div>

                    {selectedBooking.event?.category && (
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                          Category
                        </p>
                        <span className="inline-block bg-acid/10 text-acid px-3 py-1 rounded-full text-xs font-bold border border-acid/20">
                          {selectedBooking.event.category}
                        </span>
                      </div>
                    )}

                    {/* Team Details in Dashboard Modal */}
                    {selectedBooking.teamName && (
                      <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                        <div>
                          <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">
                            Team Identity
                          </p>
                          <p className="text-lg font-bold text-acid">
                            {selectedBooking.teamName}
                          </p>
                        </div>
                        
                        {selectedBooking.teamDetails && selectedBooking.teamDetails.length > 0 && (
                          <div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wide mb-3">
                              Team Members
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              {selectedBooking.teamDetails.map((member, i) => (
                                <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${member.isLeader ? 'bg-acid/5 border-acid/20' : 'bg-white/5 border-white/10'}`}>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white uppercase">{member.name}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono italic">PH: {member.phone}</span>
                                  </div>
                                  {member.isLeader && (
                                    <span className="text-[8px] bg-acid text-black font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Leader</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Information */}
                <div className="glass-card p-6 rounded-xl border-white/10">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-acid">
                      receipt_long
                    </span>
                    Booking Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-zinc-400">Booking ID</span>
                      <span className="font-mono text-sm text-white bg-white/5 px-3 py-1 rounded">
                        {selectedBooking.id}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-zinc-400">Status</span>
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                        Confirmed
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-zinc-400">Booking Date</span>
                      <span className="text-white">
                        {formatBookingDate(selectedBooking.createdAt || selectedBooking.created_at)}
                      </span>
                    </div>

                    {selectedBooking.event?.price && (
                      <div className="flex justify-between items-center pt-3 border-t-2 border-acid/20">
                        <span className="text-lg font-semibold text-white">
                          Total Amount
                        </span>
                        <span className="text-2xl font-bold text-acid">
                          {selectedBooking.event.price === "FREE" || selectedBooking.event.price === "0" ? (
                            "FREE"
                          ) : (
                            `₹${selectedBooking.event.price.toString().replace(/₹/g, "")}`
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() =>
                      router.push(`/events/${selectedBooking.event?.slug}`)
                    }
                    className="flex-1 bg-acid text-black hover:bg-acid-hover font-bold"
                  >
                    <span className="material-symbols-outlined mr-2 text-lg">
                      visibility
                    </span>
                    View Event
                  </Button>
                  <Button
                    onClick={() => {
                      const eventId = (selectedBooking as any).eventId || selectedBooking.event_id || (selectedBooking.event as any)?._id;
                      if (eventId) router.push(`/community/${eventId}`);
                    }}
                    className="flex-1 bg-electric-purple text-white hover:bg-electric-purple/80 font-bold"
                  >
                    <span className="material-symbols-outlined mr-2 text-lg">
                      forum
                    </span>
                    Community
                  </Button>
                  <Button
                    onClick={() => setShowBookingDetails(false)}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
