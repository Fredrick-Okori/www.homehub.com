"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Ruler,
  ChevronLeft,
  Share2,
  Star,
  Zap,
  Home,
  Sparkles,
  Leaf,
  MapPinIcon,
  PenTool,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ApplicationModal } from "@/components/application-modal"

interface ListingDetailClientProps {
  listing: {
    id: number
    title: string
    price: number
    location: string
    beds: number
    baths: number
    area: number
    image: string
    description: string
    fullDescription: string
    likes: number
    type: string
  }
}

export function ListingDetailClient({ listing }: ListingDetailClientProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-primary hover:bg-primary/10">
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm">Back to listings</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground text-balance">{listing.title}</h1>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {listing.location}
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-foreground">4.9</span>
              <span>(187 reviews)</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Image and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative overflow-hidden rounded-xl bg-muted">
              <div className="aspect-video relative">
                <img
                  src={listing.image || "/placeholder.svg"}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
                >
                  <Heart
                    className={`h-5 w-5 transition-all duration-200 ${
                      isLiked ? "fill-red-500 text-red-500 scale-110" : "text-foreground"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Bed className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{listing.beds}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Bath className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{listing.baths}</p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Ruler className="h-5 w-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Area</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{(listing.area / 1000).toFixed(1)}k sqft</p>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">About this property</h2>
              <p className="text-base leading-relaxed text-foreground">{listing.fullDescription}</p>
            </div>

            {/* Key Features */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Highlights</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Modern Architecture", icon: Home },
                  { label: "Smart Home Technology", icon: Zap },
                  { label: "Luxury Finishes", icon: Sparkles },
                  { label: "Energy Efficient", icon: Leaf },
                  { label: "Premium Location", icon: MapPinIcon },
                  { label: "Professional Design", icon: PenTool },
                ].map((feature, i) => {
                  const IconComponent = feature.icon
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <IconComponent className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground">{feature.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="h-fit sticky top-24">
              <Card className="p-6 space-y-6 border-2 border-border">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-3xl font-bold text-foreground">UGX {(listing.price * 3800).toLocaleString()}</p>
                </div>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Interest Counter */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <Heart className="h-5 w-5 fill-red-500 text-red-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">People interested</p>
                    <p className="text-lg font-bold text-foreground">{isLiked ? listing.likes + 1 : listing.likes}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowApplicationModal(true)}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold rounded-lg transition-all duration-200"
                  >
                    Apply Now
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base gap-2 bg-white hover:bg-secondary/50 rounded-lg transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>

                {/* Contact Section */}
                <div className="border-t border-border pt-6 space-y-3">
                  <p className="text-sm font-semibold text-foreground">Questions about this property?</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our team of experienced real estate professionals is ready to help. Schedule a viewing or request
                    more information.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ApplicationModal
        isOpen={showApplicationModal}
        listingId={listing.id}
        listings={[listing]}
        onClose={() => setShowApplicationModal(false)}
      />
    </main>
  )
}

