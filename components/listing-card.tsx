'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Bed,
  Bath,
  Square,
  MapPin,
  Heart,
  Share2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  beds: number;
  baths: number;
  area: number;
  image: string;
  type: 'Buy' | 'Rent';
  status?: string;
  // Page-specific props
  listing?: any;
  isLiked?: boolean;
  likeCount?: number;
  onLike?: (id: string) => void;
  onApply?: (id: number) => void;
}

export function ListingCard({
  id,
  title,
  price,
  location,
  beds,
  baths,
  area,
  image,
  type,
  status,
  likeCount,
  listing,
  isLiked = false,
  onLike,
  onApply,
}: ListingCardProps) {
  const [favorite, setFavorite] = React.useState(isLiked);

  // Sync favorite state with isLiked prop
  React.useEffect(() => {
    setFavorite(isLiked);
  }, [isLiked]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(!favorite);
    onLike?.(id); // Pass string ID directly
  };

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    onApply?.(Number(id));
  };

  return (
    <Card className="overflow-hidden group">
      <Link href={`/listing/${id}`}>
        <div className="relative h-48 overflow-hidden bg-muted">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Hide the image on error
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            unoptimized={image?.startsWith('http')} // Don't optimize external URLs
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={type === 'Buy' ? 'default' : 'secondary'}>
              For {type}
            </Badge>
            {status && (
              <Badge variant="outline" className="bg-white/90">
                {status}
              </Badge>
            )}
          </div>
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={handleLike}
            >
              <Heart
                className={`h-4 w-4 ${
                  favorite ? 'fill-red-500 text-red-500' : ''
                }`}
              />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          {price > 0 ? (
            <div className="font-bold text-xl">
              ${price.toLocaleString()}
            </div>
          ) : (
            <div className="font-bold text-xl text-muted-foreground">
              Price on request
            </div>
          )}
          <Link href={`/listing/${id}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <h3 className="font-semibold text-lg line-clamp-1 mb-1">{title}</h3>
        {location && location !== "Location not specified" && location.trim() !== "" && (
          <div className="flex items-center text-sm text-muted-foreground mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            {location}
          </div>
        )}
        {likeCount !== undefined && likeCount > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <Heart className="h-3 w-3 fill-red-500 text-red-500" />
            <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
          </div>
        )}
        {(beds > 0 || baths > 0 || area > 0) && (
          <div className="flex items-center justify-between text-sm">
            {beds > 0 && (
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4 text-muted-foreground" />
                <span>{beds} beds</span>
              </div>
            )}
            {baths > 0 && (
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4 text-muted-foreground" />
                <span>{baths} baths</span>
              </div>
            )}
            {area > 0 && (
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4 text-muted-foreground" />
                <span>{area.toLocaleString()} sqft</span>
              </div>
            )}
          </div>
        )}
        {onApply && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={handleApply}
          >
            Apply Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default ListingCard;

