"use client"

import * as React from "react"
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cn } from "@/lib/utils"

interface FiltersDrawerProps {
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  selectedType: string | null
  onTypeChange: (type: string | null) => void
  selectedBeds: number | null
  onBedsChange: (beds: number | null) => void
  selectedBaths: number | null
  onBathsChange: (baths: number | null) => void
  className?: string
}

const propertyTypes = ["House", "Condo", "Townhouse", "Loft", "Apartment", "Villa"]

export function FiltersDrawer({
  priceRange,
  onPriceChange,
  selectedType,
  onTypeChange,
  selectedBeds,
  onBedsChange,
  selectedBaths,
  onBathsChange,
  className,
}: FiltersDrawerProps) {
  const [open, setOpen] = React.useState(false)
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    price: true,
    type: true,
    beds: false,
    baths: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const resetFilters = () => {
    onPriceChange([0, 5000000])
    onTypeChange(null)
    onBedsChange(null)
    onBathsChange(null)
  }

  const hasActiveFilters =
    selectedType !== null ||
    selectedBeds !== null ||
    selectedBaths !== null ||
    priceRange[0] > 0 ||
    priceRange[1] < 5000000

  const FilterContent = () => (
    <div className="p-4 space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between py-2 hover:bg-secondary/50 rounded-lg px-3 transition-colors"
        >
          <span className="font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary">$</span>
            Price Range
          </span>
          {expandedSections.price ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.price && (
          <div className="px-3 space-y-4">
            <Slider
              value={priceRange}
              onValueChange={(value) => onPriceChange(value as [number, number])}
              max={5000000}
              step={50000}
              className="py-4"
            />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Min Price</Label>
                <Input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) =>
                    onPriceChange([Number.parseInt(e.target.value) || 0, priceRange[1]])
                  }
                  className="h-9"
                />
              </div>
              <span className="text-muted-foreground">-</span>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Max Price</Label>
                <Input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) =>
                    onPriceChange([priceRange[0], Number.parseInt(e.target.value) || 5000000])
                  }
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${(priceRange[0] / 1000).toFixed(0)}K</span>
              <span>${(priceRange[1] / 1000000).toFixed(1)}M</span>
            </div>
          </div>
        )}
      </div>

      {/* Property Type */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection("type")}
          className="w-full flex items-center justify-between py-2 hover:bg-secondary/50 rounded-lg px-3 transition-colors"
        >
          <span className="font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary">🏠</span>
            Property Type
          </span>
          {expandedSections.type ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.type && (
          <div className="grid grid-cols-2 gap-2 px-3">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => onTypeChange(selectedType === type ? null : type)}
                className={cn(
                  "rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  selectedType === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bedrooms */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection("beds")}
          className="w-full flex items-center justify-between py-2 hover:bg-secondary/50 rounded-lg px-3 transition-colors"
        >
          <span className="font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary">🛏️</span>
            Bedrooms
          </span>
          {expandedSections.beds ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.beds && (
          <div className="grid grid-cols-5 gap-2 px-3">
            {[null, 1, 2, 3, 4, 5].map((beds) => (
              <button
                key={beds ?? "any"}
                onClick={() => onBedsChange(beds)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  selectedBeds === beds
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {beds === null ? "Any" : beds === 5 ? "5+" : beds}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bathrooms */}
      <div className="space-y-4">
        <button
          onClick={() => toggleSection("baths")}
          className="w-full flex items-center justify-between py-2 hover:bg-secondary/50 rounded-lg px-3 transition-colors"
        >
          <span className="font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary">🚿</span>
            Bathrooms
          </span>
          {expandedSections.baths ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.baths && (
          <div className="grid grid-cols-5 gap-2 px-3">
            {[null, 1, 2, 3, 4].map((baths) => (
              <button
                key={baths ?? "any"}
                onClick={() => onBathsChange(baths)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  selectedBaths === baths
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {baths === null ? "Any" : baths}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          onClick={resetFilters}
          variant="outline"
          className="w-full"
        >
          Reset All Filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile: Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Filters
            </DrawerTitle>
            <DrawerDescription>
              Refine your search with filters
            </DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1">
            <FilterContent />
          </div>
          <DrawerFooter className="border-t pt-4">
            <Button onClick={() => setOpen(false)} className="w-full">
              Apply Filters
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Desktop: Inline dropdown or panel */}
      <div className={cn("hidden lg:block", className)}>
        <div className="relative">
          <PopoverFilterPanel
            priceRange={priceRange}
            onPriceChange={onPriceChange}
            selectedType={selectedType}
            onTypeChange={onTypeChange}
            selectedBeds={selectedBeds}
            onBedsChange={onBedsChange}
            selectedBaths={selectedBaths}
            onBathsChange={onBathsChange}
          />
        </div>
      </div>
    </>
  )
}

function PopoverFilterPanel({
  priceRange,
  onPriceChange,
  selectedType,
  onTypeChange,
  selectedBeds,
  onBedsChange,
  selectedBaths,
  onBathsChange,
}: FiltersDrawerProps) {
  const [open, setOpen] = React.useState(false)

  const resetFilters = () => {
    onPriceChange([0, 5000000])
    onTypeChange(null)
    onBedsChange(null)
    onBathsChange(null)
  }

  const hasActiveFilters =
    selectedType !== null ||
    selectedBeds !== null ||
    selectedBaths !== null ||
    priceRange[0] > 0 ||
    priceRange[1] < 5000000

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setOpen(!open)}
        className="gap-2"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {hasActiveFilters && (
          <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
            !
          </span>
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-background rounded-xl shadow-lg border animate-in fade-in slide-in-from-top-2">
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              {/* Price Range */}
              <div className="space-y-3 mb-4">
                <Label className="text-sm font-semibold">Price Range</Label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => onPriceChange(value as [number, number])}
                  max={5000000}
                  step={50000}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${(priceRange[0] / 1000).toFixed(0)}K</span>
                  <span>${(priceRange[1] / 1000000).toFixed(1)}M</span>
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-3 mb-4">
                <Label className="text-sm font-semibold">Property Type</Label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => onTypeChange(selectedType === type ? null : type)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                        selectedType === type
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-3 mb-4">
                <Label className="text-sm font-semibold">Bedrooms</Label>
                <div className="flex gap-2">
                  {[null, 1, 2, 3, 4, 5].map((beds) => (
                    <button
                      key={beds ?? "any"}
                      onClick={() => onBedsChange(beds)}
                      className={cn(
                        "flex-1 rounded-lg py-1.5 text-xs font-medium transition-all",
                        selectedBeds === beds
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {beds === null ? "Any" : beds === 5 ? "5+" : beds}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bathrooms */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Bathrooms</Label>
                <div className="flex gap-2">
                  {[null, 1, 2, 3, 4].map((baths) => (
                    <button
                      key={baths ?? "any"}
                      onClick={() => onBathsChange(baths)}
                      className={cn(
                        "flex-1 rounded-lg py-1.5 text-xs font-medium transition-all",
                        selectedBaths === baths
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {baths === null ? "Any" : baths}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
              )}
              <Button size="sm" onClick={() => setOpen(false)} className="ml-auto">
                Apply
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

