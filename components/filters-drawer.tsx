"use client"

import { FilterPanel } from "./filters-panel"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SlidersHorizontal } from "lucide-react"
import { useEffect, useState } from "react"

interface Filters {
  priceRange: number[]
  selectedType: string
  minPrice: string
  maxPrice: string
  locationFilter: string
  beds: number | null
  baths: number | null
}

interface FiltersDrawerProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onClear: () => void
  children?: React.ReactNode
}

export function FiltersDrawer({ filters, onFiltersChange, onClear, children }: FiltersDrawerProps) {
  const [open, setOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleClear = () => {
    onClear()
    setOpen(false)
  }

  if (!isMounted) {
    return (
      <>
        {children || (
          <Button variant="outline" size="sm" className="gap-2" disabled aria-hidden="true">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        )}
      </>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[360px] sm:w-[400px]">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-lg font-bold">Filters</SheetTitle>
        </SheetHeader>
        <div className="py-6">
          <FilterPanel
            filters={filters}
            onFiltersChange={onFiltersChange}
            onClear={handleClear}
          />
        </div>
        <div className="pt-4 border-t">
          <Button
            onClick={() => setOpen(false)}
            className="w-full"
          >
            Show Results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

