import { getDb, toObjectId, transformMongoDocument, transformMongoDocuments } from "./mongodb-server";

export interface Booking {
    id: string;
    eventId: string;
    userEmail: string;
    teamId?: string;
    qrCode: string;
    status: "confirmed" | "cancelled" | "pending";
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Generate a unique QR code string
 */
export function generateQRCode(): string {
    return `QR-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

/**
 * Create a booking for an event
 */
export async function createBooking(
    eventId: string,
    userEmail: string,
    teamId?: string
): Promise<Booking> {
    const db = await getDb();
    const bookingsCollection = db.collection("bookings");

    // Check if booking already exists
    const existingBooking = await bookingsCollection.findOne({
        eventId: toObjectId(eventId),
        userEmail,
    });

    if (existingBooking) {
        return transformMongoDocument<Booking>(existingBooking);
    }

    const qrCode = generateQRCode();

    const bookingData = {
        eventId: toObjectId(eventId),
        userEmail,
        teamId: teamId ? toObjectId(teamId) : undefined,
        qrCode,
        status: "confirmed" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const result = await bookingsCollection.insertOne(bookingData);

    return transformMongoDocument<Booking>({
        _id: result.insertedId,
        ...bookingData,
    });
}

/**
 * Get a user's booking for an event
 */
export async function getBooking(
    eventId: string,
    userEmail: string
): Promise<Booking | null> {
    const db = await getDb();
    const bookingsCollection = db.collection("bookings");

    const booking = await bookingsCollection.findOne({
        eventId: toObjectId(eventId),
        userEmail,
    });

    if (!booking) return null;

    return transformMongoDocument<Booking>(booking);
}

/**
 * Get all bookings for an event
 */
export async function getEventBookings(eventId: string): Promise<Booking[]> {
    const db = await getDb();
    const bookingsCollection = db.collection("bookings");

    const bookings = await bookingsCollection
        .find({
            eventId: toObjectId(eventId),
        })
        .toArray();

    return transformMongoDocuments<Booking>(bookings);
}

/**
 * Cancel a booking
 */
export async function cancelBooking(
    eventId: string,
    userEmail: string
): Promise<void> {
    const db = await getDb();
    const bookingsCollection = db.collection("bookings");

    await bookingsCollection.updateOne(
        {
            eventId: toObjectId(eventId),
            userEmail,
        },
        {
            $set: {
                status: "cancelled",
                updatedAt: new Date(),
            },
        }
    );
}

/**
 * Verify QR code
 */
export async function verifyQRCode(qrCode: string): Promise<Booking | null> {
    const db = await getDb();
    const bookingsCollection = db.collection("bookings");

    const booking = await bookingsCollection.findOne({ qrCode });

    if (!booking) return null;

    return transformMongoDocument<Booking>(booking);
}
