'use client';

import React, { memo, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Heart, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  isLiked?: boolean;
  likeCount?: number; // Prop for the count
  onLike?: (id: string) => void;
  onApply?: (id: number) => void;
  index?: number;
}

export const ListingCard = memo(function ListingCard({
  id,
  title,
  price,
  location,
  beds,
  area,
  image,
  type,
  isLiked = false,
  likeCount = 0,
  onLike,
  onApply,
  index = 0,
}: ListingCardProps) {
  const [favorite, setFavorite] = useState(isLiked);
  const [imgError, setImgError] = useState(false);

  useEffect(() => setFavorite(isLiked), [isLiked]);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorite(prev => !prev);
    onLike?.(id);
  }, [id, onLike]);

  const handleApply = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onApply?.(Number(id));
  }, [id, onApply]);

  // Priority loading for the first 4 cards to improve LCP
  const isPriority = index < 4;

  return (
    <Card className="group border-none bg-transparent shadow-none">
      <div className="flex flex-col gap-2">
        <Link href={`/listing/${id}`} className="relative block group">
          {/* IMAGE SECTION */}
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
            {!imgError ? (
              <Image
                src={image || '/placeholder.svg'}
                alt={title}
                fill
                priority={isPriority}
                loading={isPriority ? 'eager' : 'lazy'}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  console.error('Image failed to load:', image)
                  // Try to reload after a short delay in case pre-signed URL becomes available
                  const target = e.target as HTMLImageElement
                  if (target && image) {
                    setTimeout(() => {
                      target.src = image
                    }, 1000)
                  } else {
                    setImgError(true)
                  }
                }}
                quality={75}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary/30">
                <Home className="h-10 w-10 text-muted-foreground/40" />
              </div>
            )}

            {/* Top Badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-white/95 text-black hover:bg-white shadow-sm font-bold border-none px-2 py-0.5 text-[11px] uppercase tracking-wider">
                {type === 'Buy' ? 'For Sale' : 'For Rent'}
              </Badge>
            </div>

            {/* Heart Toggle on Image */}
            <button
              onClick={handleLike}
              className="absolute top-3 right-3 p-1 transition-transform active:scale-90 z-10"
              aria-label="Favorite listing"
            >
              <Heart 
                className={cn(
                  "h-6 w-6 transition-colors drop-shadow-md", 
                  favorite ? "fill-[#FF385C] text-[#FF385C]" : "text-white/90 fill-black/20"
                )} 
              />
            </button>
          </div>

          {/* TEXT CONTENT */}
          <div className="mt-3 flex flex-col space-y-0.5 px-0.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-[15px] text-[#222222] line-clamp-1 flex-1">
                {title}
              </h3>
              
              {/* REPLACED STAR WITH LIKES COUNT */}
              <div className="flex items-center gap-1.5 text-[14px] shrink-0">
                <Heart className={cn("h-3.5 w-3.5", likeCount > 0 ? "fill-[#FF385C] text-[#FF385C]" : "text-muted-foreground")} />
                <span className="font-medium text-[#222222]">{likeCount.toLocaleString()}</span>
              </div>
            </div>
            
            <p className="text-[14px] text-[#717171] line-clamp-1">{location}</p>
            <p className="text-[14px] text-[#717171]">
              {beds} beds • {area.toLocaleString()} sqft
            </p>

            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-bold text-[15px] text-[#222222]">${price.toLocaleString()}</span>
              {type === 'Rent' && <span className="text-[#717171] text-[14px]">/ month</span>}
            </div>
          </div>
        </Link>

        {/* APPLY BUTTON */}
        {onApply && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full rounded-lg border-[#DDDDDD] hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 font-semibold py-5"
            onClick={handleApply}
          >
            Apply Now
          </Button>
        )}
      </div>
    </Card>
  );
});