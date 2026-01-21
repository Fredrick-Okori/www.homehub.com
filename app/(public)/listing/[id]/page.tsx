import { Metadata } from "next"
import { ListingDetailClient } from "./listing-detail"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('title, description, images')
    .eq('id', id)
    .eq('status', 'available')
    .single()

  if (!listing) {
    return {
      title: "Listing Not Found | HomeHub",
      description: "The property you're looking for doesn't exist or is no longer available.",
    }
  }

  return {
    title: listing.title ? `${listing.title} | HomeHub` : "Property Listing | HomeHub",
    description: listing.description || "View this property on HomeHub - your modern real estate platform.",
    openGraph: {
      title: listing.title,
      description: listing.description,
      images: listing.images && listing.images.length > 0 ? [listing.images[0]] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description: listing.description,
      images: listing.images && listing.images.length > 0 ? [listing.images[0]] : [],
    },
  }
}

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch listing from Supabase
  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .eq('status', 'available')
    .single();

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Listing not found</h1>
          <p className="text-muted-foreground">
            The property you&apos;re looking for doesn&apos;t exist or is no longer available.
          </p>
        </div>
      </div>
    )
  }

  // Map database listing to component format
  const mappedListing = {
    id: parseInt(listing.id.slice(0, 8), 16) || 0, // Convert UUID to number for compatibility
    title: listing.title,
    price: 0, // Not in DB schema
    location: "Location not specified", // Not in DB schema
    beds: 0, // Not in DB schema
    baths: 0, // Not in DB schema
    area: 0, // Not in DB schema
    image: listing.images && listing.images.length > 0 ? listing.images[0] : '/placeholder.svg',
    description: listing.description || '',
    fullDescription: listing.description || 'No description available.',
    likes: 0, // Not in DB schema
    type: "House", // Default type
    images: listing.images || [], // Pass all images for the detail view
  }

  return <ListingDetailClient listing={mappedListing} />
}

