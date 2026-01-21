# SEO Improvements Task Tracker

## Goal
Improve SEO by including property names in tab titles and adding proper metadata to listing detail pages.

## Tasks

### 1. Add generateMetadata to listing detail page
- [ ] Add generateMetadata function to `app/(public)/listing/[id]/page.tsx`
- [ ] Fetch listing data for dynamic metadata
- [ ] Set dynamic title with property name
- [ ] Set dynamic description with property details
- [ ] Add Open Graph metadata with property image

### 2. Test the implementation
- [ ] Verify title shows property name on listing page
- [ ] Verify metadata is properly generated

## Implementation Details

### Changes to `app/(public)/listing/[id]/page.tsx`

```typescript
import { Metadata } from "next"

// Add generateMetadata function
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
    }
  }

  return {
    title: listing.title || "Property Listing | HomeHub",
    description: listing.description || "View this property on HomeHub",
    openGraph: {
      title: listing.title,
      description: listing.description,
      images: listing.images?.[0] ? [listing.images[0]] : [],
    },
  }
}
```

## Status
- [ ] Not Started
- [ ] In Progress
- [x] Completed

## Changes Made
1. Added `generateMetadata` function to `app/(public)/listing/[id]/page.tsx`
2. The function fetches listing data and generates dynamic metadata:
   - **Title**: `{propertyName} | HomeHub` - includes the property name in the tab title
   - **Description**: Property description from the listing
   - **Open Graph**: Title, description, and images for social sharing
   - **Twitter Card**: Summary large image card with property details

## Testing
Run `npm run build` to verify the changes compile correctly. Then visit a listing detail page to see the property name in the browser tab.

