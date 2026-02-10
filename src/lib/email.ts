import { Resend } from 'resend';
import { BookingConfirmation } from '@/components/emails/BookingConfirmation';
import QRCode from 'qrcode';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendBookingConfirmationParams {
    userEmail: string;
    userName: string;
    eventName: string;
    ticketQuantity: number;
    bookingId: string;
    eventDate?: string;
    eventTime?: string;
    venue?: string;
    qrCode: string; // The token string to encode
}

export async function sendBookingConfirmation({
    userEmail,
    userName,
    eventName,
    ticketQuantity,
    bookingId,
    eventDate,
    eventTime,
    venue,
    qrCode,
}: SendBookingConfirmationParams) {
    try {
        // Generate QR Code Data URL
        const qrCodeDataUrl = await QRCode.toDataURL(qrCode, {
            errorCorrectionLevel: 'H',
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
            width: 300,
        });
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        if (fromEmail.includes('onboarding@resend.dev')) {
            console.warn('⚠️ USING RESEND TEST DOMAIN: Emails can only be sent to the registered Resend account email.');
        }

        const { data, error } = await resend.emails.send({
            from: `Rkade <${fromEmail}>`,
            to: [userEmail],
            subject: `Booking Confirmed: ${eventName}`,
            react: BookingConfirmation({
                userName,
                eventName,
                ticketQuantity,
                bookingId,
                eventDate,
                eventTime,
                venue,
                qrCodeDataUrl,
            }),
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email Sending Exception:', error);
        return { success: false, error };
    }
}
