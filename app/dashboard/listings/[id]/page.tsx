'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Calendar, Image as ImageIcon, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { getPresignedUrls } from '@/lib/s3-presigned';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  images: string[] | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export default function ListingDetailPage() {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [listing, setListing] = React.useState<Listing | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [imageLoading, setImageLoading] = React.useState<{ [key: number]: boolean }>({});
  const [imageErrors, setImageErrors] = React.useState<{ [key: number]: boolean }>({});
  const [presignedUrls, setPresignedUrls] = React.useState<Map<string, string>>(new Map());

  // Helper functions - MUST be hooks called before any conditional returns
  const handleImageLoad = React.useCallback((index: number) => {
    console.log(`Image ${index} loaded successfully`);
    setImageLoading((prev) => ({ ...prev, [index]: false }));
  }, []);

  const handleImageError = React.useCallback((index: number, imageUrl: string) => {
    console.error(`Image ${index} failed to load:`, imageUrl);
    setImageLoading((prev) => ({ ...prev, [index]: false }));
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  }, []);

  // Fetch listing effect
  React.useEffect(() => {
    const fetchListing = async () => {
      console.log('Fetching listing with params:', params);
      const listingId = params?.id;
      
      if (!listingId || typeof listingId !== 'string') {
        console.warn('Invalid listing ID:', listingId);
        setLoading(false);
        toast.error('Invalid listing ID');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching listing from Supabase with ID:', listingId);
        
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', listingId)
          .single();

        if (error) {
          console.error('Error fetching listing:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
          toast.error(`Failed to load listing: ${error.message || 'Unknown error'}`);
          // Don't redirect immediately, let user see the error
          setListing(null);
          return;
        }

        console.log('Listing fetched successfully:', data);
        setListing(data);
      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred while loading the listing');
        setListing(null);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [params, supabase]);

  // Fetch pre-signed URLs when listing is loaded
  React.useEffect(() => {
    if (!listing || !listing.images || listing.images.length === 0) {
      setPresignedUrls(new Map());
      setImageLoading({});
      setImageErrors({});
      return;
    }

    // Fetch pre-signed URLs for all images
    const fetchPresignedUrls = async () => {
      try {
        const urlMap = await getPresignedUrls(listing.images || []);
        setPresignedUrls(urlMap);
        
        // Initialize loading state for all images
        const loadingState: { [key: number]: boolean } = {};
        listing.images.forEach((_, index) => {
          loadingState[index] = true;
        });
        setImageLoading(loadingState);
      } catch (error) {
        console.error('Error fetching pre-signed URLs:', error);
        // Fallback to original URLs
        const urlMap = new Map<string, string>();
        listing.images.forEach((url) => urlMap.set(url, url));
        setPresignedUrls(urlMap);
      }
    };

    fetchPresignedUrls();

    // Set timeout to show error if image takes too long (30 seconds)
    const timeouts: NodeJS.Timeout[] = [];
    listing.images.forEach((imageUrl, index) => {
      const timeout = setTimeout(() => {
        setImageLoading((prev) => {
          if (prev[index]) {
            console.warn(`Image ${index} (${imageUrl}) is taking too long to load`);
            setImageLoading((prevState) => ({ ...prevState, [index]: false }));
            setImageErrors((prevState) => ({ ...prevState, [index]: true }));
          }
          return prev;
        });
      }, 30000);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [listing]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: 'Available', variant: 'default' as const, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      pending: { label: 'Pending', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      sold: { label: 'Sold', variant: 'outline' as const, className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
      rented: { label: 'Rented', variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading listing details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !listing) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-2xl font-bold mb-2">Listing Not Found</h2>
            <p className="text-muted-foreground mb-2">
              The listing you're looking for doesn't exist or couldn't be loaded.
            </p>
            {params?.id && (
              <p className="text-sm text-muted-foreground mb-6">
                Listing ID: {params.id}
              </p>
            )}
            <Button onClick={() => router.push('/dashboard/listings')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  const images = listing?.images || [];
  const hasImages = images.length > 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/listings')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Listing Details</h1>
            <p className="text-muted-foreground mt-1">View and manage listing information</p>
          </div>
        </div>
        {listing && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/listings/${listing.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images Gallery */}
          {hasImages ? (
            <Card>
              <CardHeader>
                <CardTitle>Media ({images.length} {images.length === 1 ? 'image' : 'images'})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                    {imageLoading[selectedImageIndex] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {imageErrors[selectedImageIndex] ? (
                      <div className="h-full w-full flex items-center justify-center bg-muted">
                        <div className="text-center p-4">
                          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">Failed to load image</p>
                          <a
                            href={images[selectedImageIndex]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 justify-center"
                          >
                            Open image URL
                            <ExternalLink className="h-3 w-3" />
                          </a>
                          <p className="text-xs text-muted-foreground mt-2 break-all max-w-md mx-auto">
                            {images[selectedImageIndex]}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={presignedUrls.get(images[selectedImageIndex]) || images[selectedImageIndex]}
                        alt={`${listing.title} - Image ${selectedImageIndex + 1}`}
                        className={`h-full w-full object-cover transition-opacity duration-300 ${
                          imageLoading[selectedImageIndex] ? 'opacity-0' : 'opacity-100'
                        }`}
                        onLoad={() => handleImageLoad(selectedImageIndex)}
                        onError={() => handleImageError(selectedImageIndex, images[selectedImageIndex])}
                        loading="eager"
                      />
                    )}
                  </div>

                  {/* Thumbnail Grid */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={async () => {
                            setSelectedImageIndex(index);
                            // Reset loading state when changing image
                            setImageLoading((prev) => ({ ...prev, [index]: true }));
                            setImageErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors[index];
                              return newErrors;
                            });
                            // Ensure pre-signed URL is available for this image
                            if (!presignedUrls.has(image)) {
                              try {
                                const urlMap = await getPresignedUrls([image]);
                                setPresignedUrls((prev) => new Map([...prev, ...urlMap]));
                              } catch (error) {
                                console.error('Error fetching pre-signed URL:', error);
                              }
                            }
                          }}
                          className={`relative aspect-video overflow-hidden rounded-lg border-2 transition-all ${
                            selectedImageIndex === index
                              ? 'border-primary ring-2 ring-primary ring-offset-2'
                              : 'border-transparent hover:border-muted-foreground/50'
                          }`}
                        >
                          {imageLoading[index] && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                          )}
                          {imageErrors[index] ? (
                            <div className="h-full w-full flex items-center justify-center bg-muted">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          ) : (
                            <img
                              src={presignedUrls.get(image) || image}
                              alt={`Thumbnail ${index + 1}`}
                              className={`h-full w-full object-cover transition-opacity duration-300 ${
                                imageLoading[index] ? 'opacity-0' : 'opacity-100'
                              }`}
                              onLoad={() => handleImageLoad(index)}
                              onError={() => handleImageError(index, image)}
                              loading="lazy"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No images available for this listing</p>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Listing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Title</label>
                <p className="text-lg font-semibold mt-1">{listing.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">{getStatusBadge(listing.status)}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Listing ID</label>
                <p className="text-sm font-mono text-muted-foreground mt-1 break-all">{listing.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created At
                </label>
                <p className="text-sm mt-1">{formatDate(listing.created_at)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Updated At
                </label>
                <p className="text-sm mt-1">{formatDate(listing.updated_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/dashboard/listings/${listing.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Listing
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Listing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

