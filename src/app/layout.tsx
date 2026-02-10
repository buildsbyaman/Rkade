import type { Metadata } from "next";
import { Space_Grotesk, Lexend } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { ConditionalWrapper } from "@/components/layout/ConditionalWrapper";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display"
});

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: {
    default: "Rkade - Your Campus. Your Arena.",
    template: "%s | Rkade"
  },
  description: "The ultimate platform for university events, sports tournaments, and entertainment.",
  keywords: [
    "campus events",
    "university entertainment",
    "student activities",
    "college events",
    "campus life",
    "event management",
    "student community",
    "university platform"
  ],
  authors: [{ name: "Rkade Team" }],
  creator: "Rkade",
  publisher: "Rkade",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://rkade.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://rkade.in',
    title: 'Rkade - Your Campus. Your Arena.',
    description: 'The ultimate platform for university events, sports tournaments, and entertainment.',
    siteName: 'Rkade',
    images: [{
      url: '/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Rkade - Campus Events Platform',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rkade - Your Campus. Your Arena.',
    description: 'The ultimate platform for university events, sports tournaments, and entertainment.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

import { AmbientBackground } from "@/components/ui/AmbientBackground";

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* ... existing head content ... */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <script src="/sw-register.js" defer></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // ... existing json ...
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Rkade',
              description: 'Campus Events & Entertainment Platform',
              url: 'https://rkade.in',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://rkade.in/search?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              },
              sameAs: [
                'https://twitter.com/rkade',
                'https://facebook.com/rkade',
                'https://instagram.com/rkade'
              ]
            })
          }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${lexend.variable} font-body antialiased bg-obsidian text-white selection:bg-acid selection:text-black min-h-screen flex flex-col`} suppressHydrationWarning={true}>
        <AmbientBackground />
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        )}
        <AuthProvider>
          <ConditionalWrapper>
            {children}
          </ConditionalWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}