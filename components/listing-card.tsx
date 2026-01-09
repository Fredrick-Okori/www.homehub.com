"use client"

import Link from "next/link"
import { Heart, MapPin, Bed, Bath, Ruler } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ListingCardProps {
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
    likes: number
    type: string
  }
  isLiked: boolean
  onLike: (id: number) => void
  onApply: (id: number) => void
}

export function ListingCard({ listing, isLiked, onLike, onApply }: ListingCardProps) {
  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="group cursor-pointer">
        <div className="relative overflow-hidden rounded-2xl bg-muted mb-3">
          <div className="aspect-square overflow-hidden relative">
            <img
              src={listing.image || "/placeholder.svg"}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Like Button - Airbnb style */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onLike(listing.id)
              }}
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 transition-all duration-200 hover:bg-white active:scale-95 shadow-md hover:shadow-lg"
            >
              <Heart
                className={`h-5 w-5 transition-all duration-200 ${
                  isLiked ? "fill-red-500 text-red-500 scale-110" : "text-foreground"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-1 bg-white text-foreground">
          {/* Title and Location */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm group-hover:underline line-clamp-1">
                {listing.title}
              </h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="line-clamp-1">{listing.location}</span>
              </div>
            </div>
            {/* Like Counter */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              <span>{isLiked ? listing.likes + 1 : listing.likes}</span>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{listing.description}</p>

          {/* Features Row */}
          <div className="flex gap-4 text-xs text-muted-foreground py-1">
            <div className="flex items-center gap-1">
              <Bed className="h-3 w-3" />
              <span>
                {listing.beds} bed{listing.beds !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              <span>{listing.baths} bath</span>
            </div>
            <div className="flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              <span>{listing.area.toLocaleString()} sqft</span>
            </div>
          </div>

          {/* Price and Button */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <div>
              <p className="text-sm font-bold text-foreground">UGX {(listing.price * 3800).toLocaleString()}</p>
            </div>
            <Button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onApply(listing.id)
              }}
              size="sm"
              className="rounded-full text-xs h-8 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
