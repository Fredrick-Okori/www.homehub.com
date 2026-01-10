"use client"

import { MapPin, DollarSign, Home as HomeIcon, Map, X } from "lucide-react"
import { FiltersDrawer } from "@/components/filters-drawer"
import { ListingCard } from "@/components/listing-card"
import { ApplicationModal } from "@/components/application-modal"
import { useSearch } from "@/components/search-context"
import { HeroSection } from "@/components/hero-section"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

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

export default function Home() {
  const { searchTerm, setSearchTerm, filtersOpen, setFiltersOpen } = useSearch()
  const [listings] = useState(mockListings)
  const [likedListings, setLikedListings] = useState<number[]>([])
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000])
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [titleFilter, setTitleFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(10000000)

  const toggleLike = (id: number) => {
    setLikedListings((prev) => (prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id]))
  }

  const filteredListings = listings.filter((listing) => {
    const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1]
    const matchesType = !selectedType || listing.type === selectedType
    const matchesSearch =
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTitle = !titleFilter || listing.title.toLowerCase().includes(titleFilter.toLowerCase())
    const matchesLocation = !locationFilter || listing.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesMinPrice = listing.price >= minPrice
    const matchesMaxPrice = listing.price <= maxPrice
    return matchesPrice && matchesType && matchesSearch && matchesTitle && matchesLocation && matchesMinPrice && matchesMaxPrice
  })

  return (
    <main className="min-h-screen bg-background">
      <FiltersDrawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      <HeroSection />

      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Results Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">Homes available</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Showing {filteredListings.length} of {listings.length} properties
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mb-8 p-4 rounded-xl border border-border bg-white shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Title Filter */}
            <div className="col-span-1">
              <label htmlFor="title-filter" className="sr-only">
                Search by title
              </label>
              <div className="relative">
                <HomeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="title-filter"
                  placeholder="Search title..."
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  className="pl-9 h-10 rounded-full"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="col-span-1">
              <label htmlFor="location-filter" className="sr-only">
                Search by location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="location-filter"
                  placeholder="Search location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-9 h-10 rounded-full"
                />
              </div>
            </div>

            {/* Min Price Filter */}
            <div className="col-span-1">
              <label htmlFor="min-price" className="sr-only">
                Minimum price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="min-price"
                  type="number"
                  placeholder="Min price"
                  value={minPrice || ""}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="pl-9 h-10 rounded-full"
                />
              </div>
            </div>

            {/* Max Price Filter */}
            <div className="col-span-1">
              <label htmlFor="max-price" className="sr-only">
                Maximum price
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="max-price"
                  type="number"
                  placeholder="Max price"
                  value={maxPrice || ""}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="pl-9 h-10 rounded-full"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="col-span-1">
              <Button
                variant="outline"
                onClick={() => {
                  setTitleFilter("")
                  setLocationFilter("")
                  setMinPrice(0)
                  setMaxPrice(10000000)
                }}
                className="w-full h-10 rounded-full gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              id={String(listing.id)}
              title={listing.title}
              price={listing.price}
              location={listing.location}
              beds={listing.beds}
              baths={listing.baths}
              area={listing.area}
              image={listing.image}
              type={listing.type as 'Buy' | 'Rent'}
              isLiked={likedListings.includes(listing.id)}
              onLike={toggleLike}
              onApply={setSelectedApplication}
            />
          ))}
        </div>

        {filteredListings.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 py-12">
            <Map className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-semibold text-foreground">No properties found</p>
            <p className="mt-2 text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <ApplicationModal
        isOpen={selectedApplication !== null}
        listingId={selectedApplication}
        listings={listings}
        onClose={() => setSelectedApplication(null)}
      />
    </main>
  )
}

