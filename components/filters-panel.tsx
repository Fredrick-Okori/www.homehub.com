"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"

interface FilterPanelProps {
  filters: {
    priceRange: number[]
    selectedType: string
    minPrice: string
    maxPrice: string
    locationFilter: string
    beds: number | null
    baths: number | null
  }
  onFiltersChange: (filters: any) => void
  onClear: () => void
}

const propertyTypes = [
  { value: "all", label: "All Types" },
  { value: "House", label: "House" },
  { value: "Apartment", label: "Apartment" },
  { value: "Condo", label: "Condo" },
  { value: "Townhouse", label: "Townhouse" },
  { value: "Loft", label: "Loft" },
  { value: "Villa", label: "Villa" },
]

const bedOptions = [
  { value: "any", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
]

const bathOptions = [
  { value: "any", label: "Any" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
]

export function FilterPanel({ filters, onFiltersChange, onClear }: FilterPanelProps) {
  const handlePriceRangeChange = (value: number[]) => {
    onFiltersChange({ ...filters, priceRange: value })
  }

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onFiltersChange({ ...filters, minPrice: value })
  }

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onFiltersChange({ ...filters, maxPrice: value })
  }

  const handleTypeChange = (value: string) => {
    onFiltersChange({ ...filters, selectedType: value })
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, locationFilter: e.target.value })
  }

  const handleBedsChange = (value: string) => {
    onFiltersChange({ ...filters, beds: value === "any" ? null : parseInt(value) })
  }

  const handleBathsChange = (value: string) => {
    onFiltersChange({ ...filters, baths: value === "any" ? null : parseInt(value) })
  }

  const hasActiveFilters = 
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 10000000 ||
    filters.selectedType !== "all" ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.locationFilter !== "" ||
    filters.beds !== null ||
    filters.baths !== null

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Price Range</Label>
          <span className="text-sm text-muted-foreground">
            ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
          </span>
        </div>
        <Slider
          defaultValue={filters.priceRange}
          max={10000000}
          step={50000}
          onValueChange={handlePriceRangeChange}
          className="w-full"
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="min-price" className="text-xs text-muted-foreground">Min Price</Label>
            <Input
              id="min-price"
              type="number"
              placeholder="No min"
              value={filters.minPrice}
              onChange={handleMinPriceChange}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-price" className="text-xs text-muted-foreground">Max Price</Label>
            <Input
              id="max-price"
              type="number"
              placeholder="No max"
              value={filters.maxPrice}
              onChange={handleMaxPriceChange}
              className="h-9"
            />
          </div>
        </div>
      </div>

      {/* Property Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Property Type</Label>
        <Select value={filters.selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Location</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="City, neighborhood, or ZIP"
            value={filters.locationFilter}
            onChange={handleLocationChange}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Beds & Baths */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Rooms</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="beds" className="text-xs text-muted-foreground">Bedrooms</Label>
            <Select 
              value={filters.beds === null ? "any" : String(filters.beds)} 
              onValueChange={handleBedsChange}
            >
              <SelectTrigger id="beds">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {bedOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="baths" className="text-xs text-muted-foreground">Bathrooms</Label>
            <Select 
              value={filters.baths === null ? "any" : String(filters.baths)} 
              onValueChange={handleBathsChange}
            >
              <SelectTrigger id="baths">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {bathOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={onClear}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      )}
    </div>
  )
}

