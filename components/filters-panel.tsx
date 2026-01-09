"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FiltersPanelProps {
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  selectedType: string | null
  onTypeChange: (type: string | null) => void
}

const propertyTypes = ["House", "Condo", "Townhouse", "Loft"]

export function FiltersPanel({ priceRange, onPriceChange, selectedType, onTypeChange }: FiltersPanelProps) {
  return (
    <div className="h-fit space-y-4 sticky top-24 hidden lg:block">
      <Card className="p-6 border-primary/20 shadow-sm">
        <h2 className="font-bold text-lg text-foreground mb-4">Filters</h2>

        {/* Price Range */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-foreground">Price Range</label>
            <div className="mt-3 space-y-2">
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={priceRange[0]}
                onChange={(e) => onPriceChange([Number.parseInt(e.target.value), priceRange[1]])}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <input
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={priceRange[1]}
                onChange={(e) => onPriceChange([priceRange[0], Number.parseInt(e.target.value)])}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-sm text-muted-foreground font-semibold">
                <span>${(priceRange[0] / 1000000).toFixed(1)}M</span>
                <span>${(priceRange[1] / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="text-sm font-semibold text-foreground mb-3 block">Property Type</label>
            <div className="space-y-2">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => onTypeChange(selectedType === type ? null : type)}
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    selectedType === type
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Button */}
          {(selectedType || priceRange[0] > 0 || priceRange[1] < 5000000) && (
            <Button
              onClick={() => {
                onPriceChange([0, 5000000])
                onTypeChange(null)
              }}
              variant="outline"
              className="w-full mt-2"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
