'use client';

import QRCode from 'react-qr-code';
import { Calendar, MapPin, Ticket, Download } from 'lucide-react';
import { useState } from 'react';

export interface BookingWithEventDetails {
    id: string;
    eventId: string;
    userEmail: string;
    qrCode: string;
    status: string;
    createdAt: string;
    event?: {
        eventName: string;
        venue?: string;
        date?: string;
        time?: string;
        landscapePoster?: string;
    };
}

export function BookingCard({ booking }: { booking: BookingWithEventDetails }) {
    const [showQR, setShowQR] = useState(false);

    const eventName = booking.event?.eventName || 'Event';
    const venue = booking.event?.venue || 'TBA';
    const date = booking.event?.date
        ? new Date(booking.event.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })
        : 'TBA';
    const time = booking.event?.time || '';

    const handleDownloadQR = () => {
        const svg = document.getElementById(`qr-${booking.id}`);
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.download = `ticket-${booking.id}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    const statusColors = {
        confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
        pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const statusColor = statusColors[booking.status as keyof typeof statusColors] || statusColors.pending;

    return (
        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
            {/* Event Info */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">{eventName}</h3>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            {venue && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{venue}</span>
                                </div>
                            )}
                            {date && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{date} {time && `• ${time}`}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor} capitalize`}>
                        {booking.status}
                    </span>
                </div>

                {/* QR Code Section */}
                {booking.status === 'confirmed' && booking.qrCode && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                        <button
                            onClick={() => setShowQR(!showQR)}
                            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm transition-colors"
                        >
                            <Ticket className="w-4 h-4" />
                            {showQR ? 'Hide QR Code' : 'Show QR Code'}
                        </button>

                        {showQR && (
                            <div className="mt-4 p-4 bg-white dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/10">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="bg-white p-4 rounded-lg">
                                        <QRCode
                                            id={`qr-${booking.id}`}
                                            value={booking.qrCode}
                                            size={200}
                                            level="H"

                                        />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            Show this QR code at the venue for entry
                                        </p>
                                        <p className="text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded">
                                            {booking.qrCode}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDownloadQR}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download QR Code
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400">
                    Booked on {new Date(booking.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                </div>
            </div>
        </div>
    );
}
