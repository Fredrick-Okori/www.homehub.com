"use client"

import { X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface FiltersDrawerProps {
  isOpen: boolean
  onClose: () => void
  priceRange: [number, number]
  onPriceChange: (range: [number, number]) => void
  selectedType: string | null
  onTypeChange: (type: string | null) => void
}

const propertyTypes = ["House", "Condo", "Townhouse", "Loft"]

export function FiltersDrawer({
  isOpen,
  onClose,
  priceRange,
  onPriceChange,
  selectedType,
  onTypeChange,
}: FiltersDrawerProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    type: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-96 bg-white z-50 shadow-lg overflow-y-auto animate-in slide-in-from-right">
        {/* Header */}
        <div className="sticky top-0 border-b border-border bg-white p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Filters</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Price Range */}
          <div>
            <button
              onClick={() => toggleSection("price")}
              className="w-full flex items-center justify-between py-3 hover:bg-secondary/50 rounded-lg px-2 transition-colors"
            >
              <span className="font-semibold text-foreground">Price Range</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.price ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.price && (
              <div className="px-2 pb-4 space-y-4">
                <div className="space-y-2">
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
            )}
          </div>

          {/* Property Type */}
          <div>
            <button
              onClick={() => toggleSection("type")}
              className="w-full flex items-center justify-between py-3 hover:bg-secondary/50 rounded-lg px-2 transition-colors"
            >
              <span className="font-semibold text-foreground">Property Type</span>
              <ChevronDown className={`h-5 w-5 transition-transform ${expandedSections.type ? "rotate-180" : ""}`} />
            </button>
            {expandedSections.type && (
              <div className="px-2 pb-4 space-y-2">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => onTypeChange(selectedType === type ? null : type)}
                    className={`w-full rounded-lg px-4 py-3 text-sm font-medium text-left transition-all duration-200 ${
                      selectedType === type
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Button */}
          {(selectedType || priceRange[0] > 0 || priceRange[1] < 5000000) && (
            <Button
              onClick={() => {
                onPriceChange([0, 5000000])
                onTypeChange(null)
              }}
              variant="outline"
              className="w-full"
            >
              Reset Filters
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 border-t border-border bg-white p-4 space-y-3">
          <Button onClick={onClose} className="w-full">
            Apply Filters
          </Button>
        </div>
      </div>
    </>
  )
}
