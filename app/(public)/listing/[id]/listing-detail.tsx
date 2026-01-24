"use client"

import React, { useState, useEffect, memo } from "react"
import Link from "next/link"
import Image from "next/image"
import { getPresignedUrl, getPresignedUrls } from "@/lib/s3-presigned"
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
import { getLikeCount, getUserLikes, toggleLike } from "@/lib/likes"

interface ListingDetailClientProps {
  listing: {
    id: string
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
    images?: string[]
  }
}

export function ListingDetailClient({ listing }: ListingDetailClientProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map())
  const [likeCount, setLikeCount] = useState<number>(listing.likes || 0)
  const [loadingLikes, setLoadingLikes] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch like count and user like status on mount
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        setLoadingLikes(true)
        // Fetch like count
        const count = await getLikeCount(listing.id)
        setLikeCount(count)
        
        // Fetch user likes to check if this listing is liked
        const userLikes = await getUserLikes()
        setIsLiked(userLikes.includes(listing.id))
      } catch (error) {
        console.error('Error fetching likes:', error)
      } finally {
        setLoadingLikes(false)
      }
    }
    
    fetchLikes()
  }, [listing.id])

  // Fetch pre-signed URLs for images
  useEffect(() => {
    let cancelled = false
    const images = listing.images || []

    if (images.length === 0) {
      return
    }

    // Set immediate fallback URLs so images can render right away
    setImageUrls((prev) => {
      const updated = new Map(prev)
      images.forEach((url) => {
        if (!updated.has(url)) {
          updated.set(url, url)
        }
      })
      return updated
    })

    // Fetch first image quickly so it shows ASAP
    const fetchFirstImage = async () => {
      const firstImage = images[0]
      if (!firstImage) return

      try {
        const presigned = await getPresignedUrl(firstImage)
        if (!cancelled) {
          setImageUrls((prev) => {
            const updated = new Map(prev)
            updated.set(firstImage, presigned)
            return updated
          })
        }
      } catch (error) {
        console.error('Error fetching first image URL:', error)
        if (!cancelled) {
          setImageUrls((prev) => {
            const updated = new Map(prev)
            updated.set(firstImage, firstImage)
            return updated
          })
        }
      } finally {
        // no-op
      }
    }

    // Fetch all images in the background
    const fetchAllImages = async () => {
      try {
        const urlMap = await getPresignedUrls(images)
        if (!cancelled) {
          setImageUrls((prev) => {
            const updated = new Map(prev)
            urlMap.forEach((value, key) => updated.set(key, value))
            return updated
          })
        }
      } catch (error) {
        console.error('Error fetching pre-signed URLs:', error)
        if (!cancelled) {
          const fallbackMap = new Map<string, string>()
          images.forEach((url) => fallbackMap.set(url, url))
          setImageUrls((prev) => {
            const updated = new Map(prev)
            fallbackMap.forEach((value, key) => updated.set(key, value))
            return updated
          })
        }
      }
    }

    fetchFirstImage()
    fetchAllImages()

    return () => {
      cancelled = true
    }
  }, [listing.images])

  const handleToggleLike = async () => {
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    
    try {
      const result = await toggleLike(listing.id)
      // Update like count based on toggle result
      if (result) {
        setLikeCount(prev => prev + 1)
      } else {
        setLikeCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revert on error
      setIsLiked(!newLikedState)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 1. TOP NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="h-4 w-4" />
              {isMounted ? (
                <>
                  <span className="font-semibold text-[#222222] hidden sm:inline">Back to listings</span>
                  <span className="font-semibold text-[#222222] sm:hidden">Back</span>
                </>
              ) : (
                <span className="font-semibold text-[#222222]">Back to listings</span>
              )}
            </Button>
          </Link>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="gap-2 underline font-semibold rounded-lg hover:bg-gray-100">
              <Share2 className="h-4 w-4" />
              {isMounted && <span className="hidden sm:inline">Share</span>}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 underline font-semibold rounded-lg hover:bg-gray-100"
              onClick={handleToggleLike}
            >
              <Heart className={cn("h-4 w-4 transition-colors", isLiked && "fill-[#FF385C] text-[#FF385C]")} />
              {isMounted && <span className="hidden sm:inline">{isLiked ? "Saved" : "Save"}</span>}
            </Button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
        {/* 2. TITLE SECTION */}
        <header className="mb-6">
          <h1 className="text-xl sm:text-2xl md:text-[26px] font-semibold text-[#222222] tracking-tight">{listing.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm font-semibold">
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
        {listing.images && listing.images.length > 0 ? (
          <>
            {/* Mobile: Show all images stacked for easy viewing */}
            <div className="mb-8 md:hidden" suppressHydrationWarning>
              {!isMounted ? (
                <div className="grid grid-cols-1 gap-3">
                  {listing.images.map((_, index) => (
                    <div key={`mobile-skeleton-${index}`} className="relative w-full h-[240px] sm:h-[280px] rounded-xl bg-gray-100 overflow-hidden">
                      <div className="h-full w-full animate-pulse bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {listing.images.map((imageUrl, index) => {
                    const imageSrc = imageUrls.get(imageUrl) || imageUrl || "/placeholder.svg"
                    return (
                      <div key={index} className="relative w-full h-[240px] sm:h-[280px] rounded-xl bg-gray-100 overflow-hidden">
                        <img
                          src={imageSrc}
                          alt={`${listing.title} - View ${index + 1}`}
                          loading={index === 0 ? "eager" : "lazy"}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            const target = e.currentTarget
                            target.src = "/placeholder.svg"
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              )}
              {/* Image counter */}
              <div className="mt-2 text-center text-sm text-gray-600">
                {listing.images.length} {listing.images.length === 1 ? 'image' : 'images'}
              </div>
            </div>

            {/* Desktop: Grid layout with main image and thumbnails */}
            <div className="hidden md:grid relative mb-8 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-xl h-[480px]">
              {/* Main large image (first image) */}
              <div className="col-span-2 row-span-2 relative">
                {!isMounted || !imageUrls.get(listing.images[0]) ? (
                  <div className="h-full w-full animate-pulse bg-gray-100" />
                ) : (
                  <Image 
                    src={imageUrls.get(listing.images[0]) || '/placeholder.svg'} 
                    alt={listing.title} 
                    fill 
                    priority 
                    className="object-cover hover:brightness-95 transition-all cursor-pointer" 
                  />
                )}
              </div>
              {/* Thumbnail images (remaining images, max 4) */}
              {listing.images.slice(1, 5).map((imageUrl, index) => (
                <div key={index} className="relative bg-gray-100">
                  {!isMounted || !imageUrls.get(imageUrl) ? (
                    <div className="h-full w-full animate-pulse bg-gray-100" />
                  ) : (
                    <Image 
                      src={imageUrls.get(imageUrl) || '/placeholder.svg'} 
                      alt={`${listing.title} - View ${index + 2}`} 
                      fill 
                      className="object-cover hover:brightness-95 transition-all cursor-pointer" 
                    />
                  )}
                </div>
              ))}
              {/* Fill remaining slots if less than 4 additional images */}
              {listing.images.length < 5 && Array.from({ length: Math.max(0, 4 - (listing.images.length - 1)) }).map((_, index) => (
                <div key={`placeholder-${index}`} className="relative bg-gray-100" />
              ))}
            </div>
          </>
        ) : (
          <div className="relative mb-8 h-[300px] md:h-[480px] rounded-xl bg-gray-100 flex items-center justify-center">
            <p className="text-muted-foreground">No images available</p>
          </div>
        )}

        {/* 4. MAIN LAYOUT GRID */}
        <div className="grid gap-8 md:gap-12 lg:grid-cols-3 relative">
          
          {/* LEFT: CONTENT */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <section className="border-b pb-6 md:pb-8">
              <div>
                <h2 className="text-lg sm:text-xl md:text-[22px] font-semibold">Property details</h2>
                <p className="text-gray-500 font-normal text-sm sm:text-base mt-1">
                  {listing.beds} beds · {listing.baths} baths · {listing.area.toLocaleString()} sqft
                </p>
              </div>
           
            </section>

            <section className="border-b pb-6 md:pb-8 space-y-4 md:space-y-6">
                <FeatureItem icon={Sparkles} title="Self check-in" desc="Check yourself in with the smartlock." />
                <FeatureItem icon={MapPinIcon} title="Great location" desc="100% of recent guests gave the location a 5-star rating." />
                <FeatureItem icon={ShieldCheck} title="Verified security" desc="This listing has verified security features for your safety." />
            </section>

            <section className="pb-6 md:pb-8">
              <p className="text-sm sm:text-base md:text-[16px] leading-6 md:leading-[24px] text-[#222222] whitespace-pre-line">
                {listing.fullDescription}
              </p>
            </section>
          </div>

          {/* RIGHT: THE STICKY FLOATING CARD */}
          <aside className="lg:col-span-1 relative py-6 md:py-10">
            <div className="sticky top-20 md:top-28 pb-6 md:pb-10">
              <Card className="rounded-xl md:rounded-2xl border bg-white p-4 sm:p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                
                {/* 1. PRICE HEADING */}
                <div className="mb-4">
                  <span className="text-lg sm:text-xl md:text-[22px] font-bold text-[#222222]">
                    UGX {(listing.price * 3800).toLocaleString()}
                  </span>
                  <span className="text-[#717171] font-normal text-sm sm:text-base"> / month</span>
                </div>

                {/* 2. SOCIAL PROOF & LIKES */}
                <div className="flex flex-col gap-3 mb-4 sm:mb-6 border-y py-3 sm:py-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#222222]">
                      <Heart className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors", isLiked ? "fill-[#FF385C] text-[#FF385C]" : "text-gray-400")} />
                      <span>{loadingLikes ? '...' : likeCount.toLocaleString()} Likes</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#222222]">
                      <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-amber-400 text-amber-400" />
                      <span>4.92 Rating</span>
                    </div>
                  </div>
                  
                  {/* Number of Interests Badge */}
                  {!loadingLikes && likeCount > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex h-6 sm:h-7 items-center justify-center rounded-full bg-red-50 px-2 sm:px-3 text-[#FF385C] border border-red-100">
                        <Users className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-tight">
                          {likeCount} {likeCount === 1 ? 'person' : 'people'} interested
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. PROPERTY SPECS BOX */}
                <div className="rounded-lg md:rounded-xl border border-gray-300 mb-4 sm:mb-6 overflow-hidden bg-white">
                   <div className="grid grid-cols-2 border-b border-gray-300">
                        <div className="p-2.5 sm:p-3 border-r border-gray-300">
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight text-[#222222]">Bedrooms</p>
                            <p className="text-xs sm:text-sm font-medium text-[#717171]">{listing.beds} beds</p>
                        </div>
                        <div className="p-2.5 sm:p-3">
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight text-[#222222]">Bathrooms</p>
                            <p className="text-xs sm:text-sm font-medium text-[#717171]">{listing.baths} baths</p>
                        </div>
                   </div>
                   <div className="p-2.5 sm:p-3">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-tight text-[#222222]">Total Area</p>
                        <p className="text-xs sm:text-sm font-medium text-[#717171]">{listing.area.toLocaleString()} sqft</p>
                   </div>
                </div>

                {/* 4. APPLY NOW BUTTON */}
              
                <Button  onClick={() => setShowApplicationModal(true)}
                  className="rounded-lg w-full text-sm sm:text-base py-2 sm:py-2.5"
                  >
                 Apply Now
                </Button>

                {/* 5. FOOTER SUBTEXT */}
                <p className="mt-3 sm:mt-4 text-center text-[11px] sm:text-[12px] text-[#717171] font-normal leading-tight px-2 sm:px-4">
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
    <div className="flex gap-3 sm:gap-4">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 mt-0.5 sm:mt-1 text-[#222222] flex-shrink-0" />
        <div>
            <p className="font-semibold text-[#222222] text-sm sm:text-base">{title}</p>
            <p className="text-[#717171] text-xs sm:text-sm leading-snug">{desc}</p>
        </div>
    </div>
  )
}