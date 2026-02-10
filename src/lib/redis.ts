import { Redis } from "@upstash/redis";

// Check if environment variables are set
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn(
    "⚠️ Warning: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set"
  );
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

export default redis;

// QR Code verification types
export interface QRCodeData {
  bookingId: string;
  userId: string;
  userEmail: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  userName: string;
  bookingDate: string;
  scanned: boolean;
  scannedAt?: string;
  scannedBy?: string;
}

// Store QR code data in Redis with expiry
export async function storeQRCode(
  qrCodeToken: string,
  data: QRCodeData,
  expiryHours: number = 48
) {
  try {
    const expirySeconds = expiryHours * 60 * 60;
    console.log(`Storing QR code in Redis: qr:${qrCodeToken}`);
    await redis.setex(
      `qr:${qrCodeToken}`,
      expirySeconds,
      JSON.stringify(data)
    );
    console.log("QR code stored successfully");
  } catch (error) {
    console.error("Error storing QR code in Redis:", error);
    throw error;
  }
}

// Retrieve QR code data from Redis
export async function getQRCodeData(
  qrCodeToken: string
): Promise<QRCodeData | null> {
  try {
    console.log(`Retrieving QR code from Redis: qr:${qrCodeToken}`);
    const data = await redis.get(`qr:${qrCodeToken}`);
    console.log("Redis raw response:", data, "Type:", typeof data);
    
    if (!data) {
      console.log("No data found in Redis for token:", qrCodeToken);
      return null;
    }
    
    // Handle both string and object responses from Redis
    let parsedData: QRCodeData;
    
    if (typeof data === 'string') {
      console.log("Parsing string data from Redis");
      parsedData = JSON.parse(data);
    } else if (typeof data === 'object') {
      console.log("Data is already an object");
      parsedData = data as QRCodeData;
    } else {
      console.error("Unexpected data type from Redis:", typeof data);
      return null;
    }
    
    console.log("Successfully retrieved QR data:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Error retrieving QR code from Redis:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    throw error;
  }
}

// Mark QR code as scanned
export async function markQRCodeAsScanned(
  qrCodeToken: string,
  scannedBy: string
): Promise<boolean> {
  try {
    console.log(`Marking QR code as scanned: ${qrCodeToken}`);
    const data = await getQRCodeData(qrCodeToken);
    if (!data) {
      console.error("QR code data not found for marking as scanned");
      return false;
    }

    data.scanned = true;
    data.scannedAt = new Date().toISOString();
    data.scannedBy = scannedBy;

    // Get TTL and update
    const ttl = await redis.ttl(`qr:${qrCodeToken}`);
    console.log(`Current TTL for ${qrCodeToken}: ${ttl}`);
    
    if (ttl > 0) {
      console.log(`Updating QR code with new scanned status, TTL: ${ttl}`);
      await redis.setex(
        `qr:${qrCodeToken}`,
        ttl,
        JSON.stringify(data)
      );
      console.log("QR code marked as scanned successfully");
    } else {
      console.warn(`TTL is ${ttl}, not updating`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error marking QR code as scanned:", error);
    throw error;
  }
}

// Delete QR code from Redis
export async function deleteQRCode(qrCodeToken: string): Promise<boolean> {
  const deleted = await redis.del(`qr:${qrCodeToken}`);
  return deleted > 0;
}

// Get QR code statistics for an event
export async function getEventQRStats(eventId: string) {
  const pattern = `qr:*`;
  const keys = await redis.keys(pattern);
  
  let totalQRCodes = 0;
  let scannedCount = 0;

  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      const qrData = JSON.parse(data as string) as QRCodeData;
      if (qrData.eventId === eventId) {
        totalQRCodes++;
        if (qrData.scanned) scannedCount++;
      }
    }
  }

  return {
    totalQRCodes,
    scannedCount,
    pendingScans: totalQRCodes - scannedCount,
  };
}
