'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { getPresignedUrl } from '@/lib/s3-presigned';

const ITEMS_PER_PAGE = 20;

// Database listing type matching Supabase schema
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

export default function ListingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [nameFilter, setNameFilter] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [imageUrlMap, setImageUrlMap] = React.useState<Map<string, string>>(new Map());

  // Fetch listings from Supabase
  React.useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching listings:', error);
          return;
        }

        setListings(data || []);

        // Fetch pre-signed URLs for all images
        if (data && data.length > 0) {
          const allImageUrls: string[] = [];
          data.forEach((listing) => {
            if (listing.images && listing.images.length > 0) {
              allImageUrls.push(...listing.images);
            }
          });

          if (allImageUrls.length > 0) {
            try {
              const response = await fetch('/api/s3-presigned', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ urls: allImageUrls }),
              });

              if (response.ok) {
                const presignedData = await response.json();
                const urlMap = new Map<string, string>();
                presignedData.urls.forEach((item: { original: string; presigned: string | null }) => {
                  if (item.presigned) {
                    urlMap.set(item.original, item.presigned);
                  } else {
                    urlMap.set(item.original, item.original); // Fallback
                  }
                });
                setImageUrlMap(urlMap);
              }
            } catch (error) {
              console.error('Error fetching pre-signed URLs:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [supabase]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: 'Available', variant: 'default' as const, className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      pending: { label: 'Pending', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      sold: { label: 'Sold', variant: 'outline' as const, className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
      rented: { label: 'Rented', variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      taken: { label: 'Taken', variant: 'outline' as const, className: 'bg-red-100 text-red-800 hover:bg-red-100' },
      applied_for: { label: 'Applied For', variant: 'outline' as const, className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getFirstImage = (images: string[] | null): string | null => {
    if (images && images.length > 0) {
      return images[0];
    }
    return null;
  };

  const getImageUrl = (imageUrl: string | null): string | null => {
    if (!imageUrl) return null;
    // Return pre-signed URL if available, otherwise return original
    return imageUrlMap.get(imageUrl) || imageUrl;
  };

  // Filter and sort listings
  const filteredListings = React.useMemo(() => {
    let result = [...listings];

    // Filter by name (title)
    if (nameFilter) {
      const query = nameFilter.toLowerCase();
      result = result.filter((listing) =>
        listing.title.toLowerCase().includes(query)
      );
    }

    // Filter by date
    if (dateFilter) {
      result = result.filter((listing) => {
        const listingDate = new Date(listing.created_at).toISOString().split('T')[0];
        return listingDate === dateFilter;
      });
    }

    // Already sorted by created_at DESC from the query, but ensure it stays sorted
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    return result;
  }, [listings, nameFilter, dateFilter]);

  // Paginate filtered listings
  const paginatedListings = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredListings.slice(startIndex, endIndex);
  }, [filteredListings, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [nameFilter, dateFilter]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">View Listings</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all property listings
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/listings/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Listing
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by title..."
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="Filter by date..."
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Listings</CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {paginatedListings.length} of {filteredListings.length} listings
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading listings...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Eye className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Listings Available</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {nameFilter || dateFilter
                  ? 'No listings match your filters. Try adjusting your search criteria.'
                  : "You haven't created any listings yet. Create your first listing to get started."}
              </p>
              <Button onClick={() => router.push('/dashboard/listings/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Listing
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Images</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">
                        <div className="font-semibold">{listing.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                          {listing.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {listing.images && listing.images.length > 0 ? (
                            <>
                              <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                                <img
                                  src={getImageUrl(getFirstImage(listing.images)) || ''}
                                  alt={listing.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="h-12 w-12 rounded-lg bg-muted flex items-center justify-center"><svg class="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                                  }}
                                />
                              </div>
                              {listing.images.length > 1 && (
                                <span className="text-xs text-muted-foreground">
                                  +{listing.images.length - 1} more
                                </span>
                              )}
                            </>
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(listing.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(listing.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/listings/${listing.id}`)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/listings/${listing.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="default"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="gap-1 px-2.5"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:block">Previous</span>
                        </Button>
                      </PaginationItem>
                      {getPageNumbers().map((page, index) => (
                        <PaginationItem key={index}>
                          {page === 'ellipsis' ? (
                            <PaginationEllipsis />
                          ) : (
                            <Button
                              variant={currentPage === page ? 'outline' : 'ghost'}
                              size="icon"
                              onClick={() => setCurrentPage(page)}
                              className={currentPage === page ? 'bg-primary text-primary-foreground' : ''}
                            >
                              {page}
                            </Button>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="default"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="gap-1 px-2.5"
                        >
                          <span className="hidden sm:block">Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

