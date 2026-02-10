import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Link,
  Row,
  Column,
  Img,
} from "@react-email/components";
import * as React from "react";

interface BookingConfirmationProps {
  userName: string;
  eventName: string;
  ticketQuantity: number;
  eventDate?: string;
  eventTime?: string;
  venue?: string;
  bookingId: string;
  qrCodeDataUrl?: string; // Data URI for the QR code image
}

export const BookingConfirmation = ({
  userName,
  eventName,
  ticketQuantity,
  eventDate,
  eventTime,
  venue,
  bookingId,
  qrCodeDataUrl,
}: BookingConfirmationProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your ticket for {eventName} - Rkade</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with gradient accent */}
          <Section style={headerSection}>
            <Heading style={brandText}>RKADE</Heading>
            <Section style={accentLine} />
          </Section>

          {/* Hero Message */}
          <Heading style={heading}>YOU&apos;RE IN.</Heading>

          <Section style={messageSection}>
            <Text style={text}>
              Hey <span style={highlight}>{userName}</span> 👋
            </Text>
            <Text style={subText}>
              Your booking is confirmed! We&apos;re excited to see you at{" "}
              <span style={eventHighlight}>{eventName}</span>
            </Text>
          </Section>

          {/* Glass Ticket Container */}
          <Section style={ticketOuterGlow}>
            <Section style={ticketContainer}>
              {/* Event Header with acid accent */}
              <Section style={ticketHeader}>
                <Heading as="h3" style={ticketTitle}>
                  {eventName}
                </Heading>
                <Section style={ticketAccentBar} />
              </Section>

              {/* Ticket Details Grid */}
              <Section style={ticketContent}>
                <Row style={ticketRow}>
                  <Column style={columnStyle}>
                    <Text style={ticketLabel}>🎫 QUANTITY</Text>
                    <Text style={ticketValue}>
                      {ticketQuantity} Ticket{ticketQuantity > 1 ? "s" : ""}
                    </Text>
                  </Column>
                  <Column style={columnStyle}>
                    <Text style={ticketLabel}>🔖 BOOKING ID</Text>
                    <Text style={ticketValue}>
                      #{bookingId.slice(-8).toUpperCase()}
                    </Text>
                  </Column>
                </Row>

                {(eventDate || eventTime) && (
                  <Row style={ticketRow}>
                    <Column style={columnStyle}>
                      <Text style={ticketLabel}>📅 DATE</Text>
                      <Text style={ticketValue}>{eventDate || "TBA"}</Text>
                    </Column>
                    <Column style={columnStyle}>
                      <Text style={ticketLabel}>⏰ TIME</Text>
                      <Text style={ticketValue}>{eventTime || "TBA"}</Text>
                    </Column>
                  </Row>
                )}

                {venue && (
                  <Row style={{ ...ticketRow, marginBottom: "0" }}>
                    <Column>
                      <Text style={ticketLabel}>📍 VENUE</Text>
                      <Text style={ticketValue}>{venue}</Text>
                    </Column>
                  </Row>
                )}
              </Section>

              {/* QR Code Section */}
              {qrCodeDataUrl && (
                <>
                  <Section style={stubLineContainer}>
                    <Hr style={dashedLine} />
                  </Section>
                  <Section style={ticketStub}>
                    <Text style={scanLabel}>SCAN FOR ENTRY</Text>
                    <Section style={qrContainer}>
                      <Img
                        src={qrCodeDataUrl}
                        width="160"
                        height="160"
                        alt="Entry QR Code"
                        style={qrCodeImage}
                      />
                    </Section>
                    <Text style={qrHint}>Show this at the venue entrance</Text>
                  </Section>
                </>
              )}

              {/* CTA Button */}
              <Section style={buttonContainer}>
                <Button style={button} href={`https://rkade.in/dashboard`}>
                  VIEW IN DASHBOARD →
                </Button>
              </Section>
            </Section>
          </Section>

          {/* Pro Tips Section */}
          <Section style={tipsSection}>
            <Text style={tipsTitle}>✨ Pro Tips</Text>
            <Text style={tipText}>
              • Save this QR code or screenshot for easy access
            </Text>
            <Text style={tipText}>
              • Arrive 15 minutes early for smooth entry
            </Text>
            <Text style={tipText}>• Bring a valid ID for verification</Text>
          </Section>

          {/* Footer */}
          <Text style={footer}>
            Need help?{" "}
            <Link href="mailto:support@rkade.in" style={link}>
              Contact Support
            </Link>
            <br />
            <br />
            <span style={footerBrand}>RKADE</span> • Where experiences come
            alive
            <br />
            <span style={footerCopy}>
              &copy; {new Date().getFullYear()} Rkade Platform. All rights
              reserved.
            </span>
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default BookingConfirmation;

// Styles - Aligned with Rkade's cyber-themed design system
const main = {
  backgroundColor: "#050505", // obsidian black
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  padding: "40px 20px",
};

const container = {
  margin: "0 auto",
  maxWidth: "560px",
  width: "100%",
};

const headerSection = {
  marginBottom: "32px",
  textAlign: "center" as const,
};

const brandText = {
  color: "#CCFF00", // acid green
  fontSize: "32px",
  fontWeight: "900",
  letterSpacing: "6px",
  margin: "0 0 12px",
  textTransform: "uppercase" as const,
};

const accentLine = {
  height: "3px",
  background: "linear-gradient(90deg, transparent, #CCFF00, transparent)",
  margin: "0 auto",
  width: "120px",
};

const heading = {
  color: "#ffffff",
  fontSize: "42px",
  fontWeight: "900",
  textAlign: "center" as const,
  margin: "0 0 16px",
  letterSpacing: "-1.5px",
  textTransform: "uppercase" as const,
};

const messageSection = {
  marginBottom: "40px",
  textAlign: "center" as const,
  padding: "0 20px",
};

const text = {
  color: "#e5e5e5",
  fontSize: "18px",
  lineHeight: "28px",
  marginBottom: "8px",
  margin: "0 0 8px",
};

const subText = {
  color: "#a0a0a0",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0",
};

const highlight = {
  color: "#CCFF00", // acid green
  fontWeight: "700",
};

const eventHighlight = {
  color: "#ffffff",
  fontWeight: "700",
};

const ticketOuterGlow = {
  padding: "4px",
  background:
    "linear-gradient(135deg, rgba(204, 255, 0, 0.1), rgba(79, 70, 229, 0.1))",
  borderRadius: "20px",
  marginBottom: "32px",
};

const ticketContainer = {
  backgroundColor: "#0F0F13", // obsidian-light
  borderRadius: "16px",
  border: "1px solid rgba(255, 255, 255, 0.08)", // glass-border
  overflow: "hidden",
  backdropFilter: "blur(10px)",
};

const ticketHeader = {
  padding: "28px 28px 20px",
  borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
};

const ticketTitle = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "800",
  margin: "0 0 12px",
  lineHeight: "1.3",
  letterSpacing: "-0.5px",
};

const ticketAccentBar = {
  height: "2px",
  width: "60px",
  background: "#CCFF00",
};

const ticketContent = {
  padding: "24px 28px",
};

const ticketRow = {
  marginBottom: "24px",
};

const columnStyle = {
  paddingRight: "12px",
};

const ticketLabel = {
  color: "#8a8a8a",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1.2px",
  textTransform: "uppercase" as const,
  marginBottom: "6px",
  margin: "0 0 6px",
};

const ticketValue = {
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
  letterSpacing: "-0.2px",
};

const stubLineContainer = {
  backgroundColor: "#0F0F13",
  padding: "0 20px",
};

const dashedLine = {
  borderTop: "2px dashed rgba(204, 255, 0, 0.2)", // acid green dashed
  margin: "0",
};

const ticketStub = {
  padding: "28px 28px 20px",
  textAlign: "center" as const,
};

const scanLabel = {
  color: "#CCFF00",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  marginBottom: "16px",
  margin: "0 0 16px",
};

const qrContainer = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "16px",
  display: "inline-block",
  margin: "0 auto",
};

const qrCodeImage = {
  display: "block",
  margin: "0 auto",
  borderRadius: "8px",
};

const qrHint = {
  color: "#666666",
  fontSize: "12px",
  marginTop: "12px",
  margin: "12px 0 0",
  fontStyle: "italic",
};

const buttonContainer = {
  padding: "20px 28px 28px",
};

const button = {
  backgroundColor: "#CCFF00", // acid green
  borderRadius: "10px",
  color: "#000000",
  fontSize: "14px",
  fontWeight: "800",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "16px 24px",
  textTransform: "uppercase" as const,
  letterSpacing: "1.5px",
  border: "none",
  boxShadow: "0 0 20px rgba(204, 255, 0, 0.3)", // neon glow
};

const tipsSection = {
  backgroundColor: "rgba(255, 255, 255, 0.03)", // glass effect
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: "12px",
  padding: "20px 24px",
  marginBottom: "32px",
};

const tipsTitle = {
  color: "#CCFF00",
  fontSize: "14px",
  fontWeight: "800",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  marginBottom: "12px",
  margin: "0 0 12px",
};

const tipText = {
  color: "#a0a0a0",
  fontSize: "14px",
  lineHeight: "22px",
  marginBottom: "6px",
  margin: "0 0 6px",
};

const footer = {
  color: "#666666",
  fontSize: "13px",
  textAlign: "center" as const,
  marginTop: "40px",
  lineHeight: "22px",
  padding: "0 20px",
};

const link = {
  color: "#CCFF00",
  textDecoration: "none",
  fontWeight: "600",
};

const footerBrand = {
  color: "#CCFF00",
  fontWeight: "800",
  letterSpacing: "2px",
};

const footerCopy = {
  color: "#444444",
  fontSize: "11px",
};
