import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { getQRCodeData, markQRCodeAsScanned } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Session optional for event staff verification
    // ...existing code...
    // ...existing code...

    const body = await request.json();
    const { qrCodeToken } = body;
    
    // ...existing code...
    // ...existing code...
    // ...existing code...
    // ...existing code...

    if (!qrCodeToken || typeof qrCodeToken !== 'string') {
      // ...existing code...
      return NextResponse.json(
        { 
          verified: false,
          genuine: false,
          error: "QR code token is required and must be a string" 
        },
        { status: 400 }
      );
    }

    const trimmedToken = qrCodeToken.trim();
    // ...existing code...

    // Get QR code data from Redis
    // ...existing code...
    const qrCodeData = await getQRCodeData(trimmedToken);

    if (!qrCodeData) {
      // ...existing code...
      return NextResponse.json(
        { 
          verified: false,
          genuine: false,
          error: "Invalid or expired QR code" 
        },
        { status: 404 }
      );
    }

    // ...existing code...

    // Check if already scanned
    if (qrCodeData.scanned) {
      // ...existing code...
      return NextResponse.json({
        verified: true,
        genuine: true,
        alreadyScanned: true,
        data: qrCodeData,
        message: "This ticket has already been scanned",
      });
    }

    // Mark as scanned
    const scannedBy = session?.user?.name || session?.user?.email || "Event Staff";
    console.log("Marking as scanned by:", scannedBy);
    const marked = await markQRCodeAsScanned(trimmedToken, scannedBy);
    
    if (!marked) {
      console.error("Failed to mark QR code as scanned");
      return NextResponse.json(
        { 
          verified: false,
          genuine: false,
          error: "Failed to mark QR code as scanned"
        },
        { status: 500 }
      );
    }

    console.log("QR code successfully marked as scanned");

    return NextResponse.json({
      verified: true,
      genuine: true,
      alreadyScanned: false,
      data: {
        bookingId: qrCodeData.bookingId,
        userName: qrCodeData.userName,
        eventName: qrCodeData.eventName,
        eventDate: qrCodeData.eventDate,
        eventVenue: qrCodeData.eventVenue,
        scannedAt: new Date().toISOString(),
        scannedBy: scannedBy,
      },
      message: "Ticket verified successfully",
    });
  } catch (error) {
    console.error("=== ERROR in QR Verification ===");
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error message:", errorMessage);
    if (error instanceof Error) {
      console.error("Stack:", error.stack);
    }
    
    return NextResponse.json(
      { 
        verified: false,
        genuine: false,
        error: "Failed to verify QR code",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check QR code status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const qrCodeToken = searchParams.get("qrCodeToken");

    if (!qrCodeToken) {
      return NextResponse.json(
        { error: "QR code token is required" },
        { status: 400 }
      );
    }

    const qrCodeData = await getQRCodeData(qrCodeToken);

    if (!qrCodeData) {
      return NextResponse.json(
        { 
          verified: false, 
          genuine: false, 
          error: "Invalid or expired QR code" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verified: true,
      genuine: true,
      scanned: qrCodeData.scanned,
      data: qrCodeData,
    });
  } catch (error) {
    console.error("Error checking QR code status:", error);
    return NextResponse.json(
      { error: "Failed to check QR code status" },
      { status: 500 }
    );
  }
}
