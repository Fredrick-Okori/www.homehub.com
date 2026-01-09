"use client"

import { useState, use } from "react"
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
import { Footer } from "@/components/footer"

const mockListings = [
  {
    id: 1,
    title: "Modern Hilltop Estate",
    price: 2500000,
    location: "Malibu, California",
    beds: 5,
    baths: 4,
    area: 4800,
    image: "/modern-hilltop-luxury-home-with-ocean-view.jpg",
    description: "Stunning hilltop property with panoramic views",
    fullDescription:
      "This exceptional modern estate sits perched on a hilltop with breathtaking panoramic views of the Pacific Ocean. Featuring floor-to-ceiling windows, smart home automation, heated infinity pool, and direct access to private hiking trails. The architecture blends seamlessly with the natural landscape, offering 5 spacious bedrooms, 4 luxury bathrooms, and a state-of-the-art kitchen with premium appliances. Perfect for those seeking luxury and natural beauty.",
    likes: 234,
    type: "House",
  },
  {
    id: 2,
    title: "Downtown Loft Living",
    price: 850000,
    location: "New York, NY",
    beds: 2,
    baths: 2,
    area: 2200,
    image: "/modern-downtown-loft-apartment-urban.jpg",
    description: "Sleek loft in the heart of the city",
    fullDescription:
      "Experience urban sophistication in this stunning loft located in the vibrant heart of downtown Manhattan. Features exposed brick, soaring 16-foot ceilings, and floor-to-ceiling windows overlooking the skyline. The open-concept living space includes a gourmet kitchen with Italian marble countertops, two spacious bedrooms with walk-in closets, and two bathrooms with luxury finishes. Building amenities include a rooftop garden, gym, and 24-hour concierge service.",
    likes: 189,
    type: "Loft",
  },
  {
    id: 3,
    title: "Suburban Family Home",
    price: 650000,
    location: "Austin, Texas",
    beds: 4,
    baths: 3,
    area: 3400,
    image: "/suburban-family-home-with-large-yard-trees.jpg",
    description: "Perfect family home with spacious yard",
    fullDescription:
      "Welcome to your dream family home in a peaceful suburban neighborhood. This beautifully designed property offers 4 generous bedrooms, 3 full bathrooms, and a modern kitchen with an island. The large backyard features a covered patio, pool, and mature landscaping—ideal for entertaining and outdoor activities. Located near top-rated schools, shopping centers, and parks. Energy-efficient systems and recent renovations make this a smart investment.",
    likes: 156,
    type: "House",
  },
  {
    id: 4,
    title: "Beachfront Luxury Condo",
    price: 3200000,
    location: "Miami Beach, Florida",
    beds: 3,
    baths: 3,
    area: 3100,
    image: "/beachfront-luxury-condo-with-ocean-view.jpg",
    description: "Exclusive beachfront living at its finest",
    fullDescription:
      "Indulge in beachfront luxury with this stunning condo in Miami's most prestigious address. Floor-to-ceiling glass walls frame unobstructed ocean views from every room. The unit features a chef's kitchen, spa-inspired bathrooms with marble finishes, and smart home technology throughout. Direct beach access, infinity pool overlooking the ocean, private wine cellar, and concierge services included. Perfect for the discerning buyer seeking ultimate oceanfront luxury.",
    likes: 412,
    type: "Condo",
  },
  {
    id: 5,
    title: "Contemporary Urban Townhouse",
    price: 920000,
    location: "San Francisco, California",
    beds: 3,
    baths: 2.5,
    area: 2800,
    image: "/contemporary-urban-townhouse-modern-design.jpg",
    description: "Stylish townhouse in vibrant neighborhood",
    fullDescription:
      "Located in one of San Francisco's most desirable neighborhoods, this contemporary townhouse offers modern living at its finest. Features include high-end finishes, an open floor plan, smart home integration, and a private roof deck with city views. Three spacious bedrooms, 2.5 bathrooms, and a modern kitchen with Italian appliances. Walking distance to restaurants, shops, and public transportation. Investment potential in an ever-appreciated market.",
    likes: 267,
    type: "Townhouse",
  },
  {
    id: 6,
    title: "Luxury Mountain Retreat",
    price: 1800000,
    location: "Aspen, Colorado",
    beds: 4,
    baths: 4,
    area: 4200,
    image: "/luxury-mountain-cabin-home-snow-ski.jpg",
    description: "Exclusive mountain escape with resort amenities",
    fullDescription:
      "This luxury mountain retreat offers the ultimate alpine lifestyle in prestigious Aspen. Custom-built with locally-sourced materials, the home features a grand master suite, guest accommodations, spa, sauna, and heated outdoor hot tub. Large windows showcase panoramic mountain views and provide plenty of natural light. Wine cellar, home theater, and chef's kitchen complete this mountain sanctuary. Perfect for both full-time living and seasonal retreats.",
    likes: 334,
    type: "House",
  },
  {
    id: 7,
    title: "Elegant Living Space",
    price: 1200000,
    location: "Beverly Hills, California",
    beds: 4,
    baths: 3,
    area: 3500,
    image: "/images/luxurious-living-room@2x.jpg",
    description: "Stunning interior with premium finishes",
    fullDescription:
      "Experience luxury living in this beautifully designed home featuring an elegant living space with premium finishes throughout. The open-concept design creates a seamless flow between living areas, while large windows flood the space with natural light. Features include a gourmet kitchen, spa-like bathrooms, and a master suite with stunning views. Smart home technology and energy-efficient systems make this home both modern and sustainable.",
    likes: 278,
    type: "House",
  },
  {
    id: 8,
    title: "Modern Family Villa",
    price: 750000,
    location: "Phoenix, Arizona",
    beds: 4,
    baths: 3,
    area: 2800,
    image: "/images/Simple-House-Design-25x39-Feet-House-Design-7.5x12-M-4-Beds-3-Bath-front-Cover.jpg",
    description: "Perfect family home with modern design",
    fullDescription:
      "This modern family villa offers the perfect blend of style and functionality. Featuring 4 bedrooms and 3 bathrooms, this home is designed for contemporary family living. The open floor plan includes a spacious living area, modern kitchen with island, and dedicated spaces for work and relaxation. The backyard features a covered patio perfect for entertaining. Located in a family-friendly neighborhood with top-rated schools nearby.",
    likes: 198,
    type: "House",
  },
]

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const listing = mockListings.find((l) => l.id === Number.parseInt(id))
  const [isLiked, setIsLiked] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  if (!listing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Property not found</h1>
          <Link href="/" className="mt-4 inline-block text-primary hover:underline">
            Back to listings
          </Link>
        </div>
      </div>
    )
  }

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
        listings={mockListings}
        onClose={() => setShowApplicationModal(false)}
      />
    </main>
  )
}

