import { Metadata } from "next"
import { ListingDetailClient } from "./listing-detail"

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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const listing = mockListings.find((l) => l.id === Number.parseInt(id))
  
  if (!listing) {
    return {
      title: "Property Not Found",
      description: "The requested property could not be found.",
    }
  }

  return {
    title: listing.title,
    description: listing.description,
    openGraph: {
      title: `${listing.title} - HomeHub`,
      description: listing.description,
      images: [
        {
          url: listing.image || "/placeholder.jpg",
          width: 1200,
          height: 630,
          alt: listing.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${listing.title} - HomeHub`,
      description: listing.description,
      images: [listing.image || "/placeholder.jpg"],
    },
  }
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = mockListings.find((l) => l.id === Number.parseInt(id))

  if (!listing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Property not found</h1>
          <a href="/" className="mt-4 inline-block text-primary hover:underline">
            Back to listings
          </a>
        </div>
      </div>
    )
  }

  return <ListingDetailClient listing={listing} />
}

