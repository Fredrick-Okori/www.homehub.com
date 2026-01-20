"use client"

import React, { useState, useEffect, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { getPresignedUrl } from "@/lib/s3-presigned"
import {
  Heart,
  ChevronLeft,
  Share2,
  Star,
  Home,
  Sparkles,
  MapPinIcon,
  ShieldCheck,
  Flag,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ApplicationModal } from "@/components/application-modal"
import { cn } from "@/lib/utils"

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
  const [imageUrl, setImageUrl] = useState<string>(listing.image)
  const [loadingImage, setLoadingImage] = useState(true)

  useEffect(() => {
    const fetchPresignedUrl = async () => {
      if (listing.image?.startsWith('http')) {
        try {
          const presignedUrl = await getPresignedUrl(listing.image)
          setImageUrl(presignedUrl)
        } catch (error) {
          console.error('Error fetching pre-signed URL:', error)
        } finally {
          setLoadingImage(false)
        }
      } else {
        setLoadingImage(false)
      }
    }
    fetchPresignedUrl()
  }, [listing.image])

  return (
    <main className="min-h-screen bg-white">
      {/* 1. TOP NAV */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span className="font-semibold text-[#222222]">Back to listings</span>
            </Button>
          </Link>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="gap-2 underline font-semibold rounded-lg hover:bg-gray-100">
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 underline font-semibold rounded-lg hover:bg-gray-100"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn("h-4 w-4 transition-colors", isLiked && "fill-[#FF385C] text-[#FF385C]")} />
              {isLiked ? "Saved" : "Save"}
            </Button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
        {/* 2. TITLE SECTION */}
        <header className="mb-6">
          <h1 className="text-[26px] font-semibold text-[#222222] tracking-tight">{listing.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              <span>4.92</span>
            </div>
            <span className="text-gray-300">·</span>
            <span className="underline cursor-pointer">128 reviews</span>
            <span className="text-gray-300">·</span>
            <span className="underline cursor-pointer">{listing.location}</span>
          </div>
        </header>

        {/* 3. PHOTO GRID */}
        <div className="relative mb-8 grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl h-[300px] md:h-[480px]">
          <div className="col-span-4 row-span-2 relative md:col-span-2">
             {loadingImage ? (
                <div className="h-full w-full animate-pulse bg-gray-100" />
             ) : (
                <Image src={imageUrl} alt="Main" fill priority className="object-cover hover:brightness-95 transition-all cursor-pointer" />
             )}
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="hidden md:block relative bg-gray-100">
              <Image src={imageUrl} alt={`View ${i + 1}`} fill className="object-cover hover:brightness-95 transition-all cursor-pointer" />
            </div>
          ))}
        </div>

        {/* 4. MAIN LAYOUT GRID */}
        <div className="grid gap-12 lg:grid-cols-3 relative">
          
          {/* LEFT: CONTENT */}
          <div className="lg:col-span-2 space-y-8">
            <section className="border-b pb-8 flex justify-between items-center">
              <div>
                <h2 className="text-[22px] font-semibold">Property details</h2>
                <p className="text-gray-500 font-normal text-base mt-1">
                  {listing.beds} beds · {listing.baths} baths · {listing.area.toLocaleString()} sqft
                </p>
              </div>
           
            </section>

            <section className="border-b pb-8 space-y-6">
                <FeatureItem icon={Sparkles} title="Self check-in" desc="Check yourself in with the smartlock." />
                <FeatureItem icon={MapPinIcon} title="Great location" desc="100% of recent guests gave the location a 5-star rating." />
                <FeatureItem icon={ShieldCheck} title="Verified security" desc="This listing has verified security features for your safety." />
            </section>

            <section className="pb-8">
              <p className="text-[16px] leading-[24px] text-[#222222] whitespace-pre-line">
                {listing.fullDescription}
              </p>
            </section>
          </div>

          {/* RIGHT: THE STICKY FLOATING CARD */}
          <aside className="lg:col-span-1 relative py-10">
            <div className="sticky top-28 pb-10">
              <Card className="rounded-2xl border bg-white p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                
                {/* 1. PRICE HEADING */}
                <div className="mb-4">
                  <span className="text-[22px] font-bold text-[#222222]">
                    UGX {(listing.price * 3800).toLocaleString()}
                  </span>
                  <span className="text-[#717171] font-normal text-base"> / month</span>
                </div>

                {/* 2. SOCIAL PROOF & LIKES */}
                <div className="flex flex-col gap-3 mb-6 border-y py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#222222]">
                      <Heart className={cn("h-4 w-4 transition-colors", isLiked ? "fill-[#FF385C] text-[#FF385C]" : "text-gray-400")} />
                      <span>{isLiked ? listing.likes + 1 : listing.likes} Likes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#222222]">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span>4.92 Rating</span>
                    </div>
                  </div>
                  
                  {/* Number of Interests Badge */}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex h-7 items-center justify-center rounded-full bg-red-50 px-3 text-[#FF385C] border border-red-100">
                      <Users className="mr-2 h-3.5 w-3.5" />
                      <span className="text-[11px] font-bold uppercase tracking-tight">
                        {listing.likes + 4} people interested
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. PROPERTY SPECS BOX */}
                <div className="rounded-xl border border-gray-300 mb-6 overflow-hidden bg-white">
                   <div className="grid grid-cols-2 border-b border-gray-300">
                        <div className="p-3 border-r border-gray-300">
                            <p className="text-[10px] font-bold uppercase tracking-tight text-[#222222]">Bedrooms</p>
                            <p className="text-sm font-medium text-[#717171]">{listing.beds} beds</p>
                        </div>
                        <div className="p-3">
                            <p className="text-[10px] font-bold uppercase tracking-tight text-[#222222]">Bathrooms</p>
                            <p className="text-sm font-medium text-[#717171]">{listing.baths} baths</p>
                        </div>
                   </div>
                   <div className="p-3">
                        <p className="text-[10px] font-bold uppercase tracking-tight text-[#222222]">Total Area</p>
                        <p className="text-sm font-medium text-[#717171]">{listing.area.toLocaleString()} sqft</p>
                   </div>
                </div>

                {/* 4. APPLY NOW BUTTON */}
              
                <Button  onClick={() => setShowApplicationModal(true)}
                  className="rounded-lg "
                  >
                 Apply Now
                </Button>

                {/* 5. FOOTER SUBTEXT */}
                <p className="mt-4 text-center text-[12px] text-[#717171] font-normal leading-tight px-4">
                  Send your application directly to the property manager for review.
                </p>
              </Card>

              {/* SECONDARY ACTION */}
              
            </div>
          </aside>

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

function FeatureItem({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
        <Icon className="h-6 w-6 mt-1 text-[#222222]" />
        <div>
            <p className="font-semibold text-[#222222] text-base">{title}</p>
            <p className="text-[#717171] text-sm leading-snug">{desc}</p>
        </div>
    </div>
  )
}