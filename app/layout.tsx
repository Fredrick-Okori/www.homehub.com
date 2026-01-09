import type React from "react"
import type { Metadata } from "next"
import { Urbanist } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LayoutWrapper } from "@/components/layout-wrapper"
import "./globals.css"

const urbanist = Urbanist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "HomeHub - Modern House Listings",
  description: "Discover your perfect home with our curated collection of modern properties",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={urbanist.className}>
        <LayoutWrapper>
          {children}
          <Analytics />
        </LayoutWrapper>
      </body>
    </html>
  )
}
