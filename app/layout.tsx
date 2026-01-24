import type React from "react"
import type { Metadata, Viewport } from "next"
import { Urbanist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const urbanist = Urbanist({ subsets: ["latin"], display: "swap", preload: true })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f20051",
}

export const metadata: Metadata = {
  metadataBase: new URL("https://homehub.com"),
  title: {
    default: "Homz - Modern House Listings & Real Estate Platform",
    template: "%s | Homz",
  },
  description: "Discover your perfect home with our curated collection of modern properties. Browse houses, condos, townhouses and more with advanced search and filtering.",
  generator: "v0.app",
  applicationName: "Homz",
  keywords: [
    "real estate",
    "houses for sale",
    "properties",
    "home listings",
    "buy house",
    "rent apartment",
    "modern homes",
    "luxury properties",
    "real estate agent",
    "property search",
  ],
  authors: [{ name: "Homz", url: "https://homehub.com" }],
  creator: "Homz",
  publisher: "Homz",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://homehub.com",
    siteName: "Homz",
    title: "Homz - Modern House Listings & Real Estate Platform",
    description: "Discover your perfect home with our curated collection of modern properties.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Homz - Find Your Dream Home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Homz - Modern House Listings",
    description: "Discover your perfect home with our curated collection of modern properties.",
    images: ["/og-image.jpg"],
    creator: "@homehub",
  },
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
    apple: "/apple-icon.png",
    shortcut: "/icon.svg",
  },
  manifest: "/site.webmanifest",
  category: "real estate",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Homz" />
        <meta name="msapplication-TileColor" content="#f20051" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
  <body className={`${urbanist.className} antialiased`}>
    <AuthProvider>
      {children}
    </AuthProvider>
    <Toaster />
    <Analytics />
  </body>
    </html>
  )
}
