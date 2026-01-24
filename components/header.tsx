"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, MapPin, Home, Building2, Key, Users, X, Menu, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSearch } from "@/components/search-context"

const navItems = [
  { href: "/", label: "Buy", icon: Home },
  { href: "/", label: "Rent", icon: Building2 },
  { href: "/", label: "Sell", icon: Key },
  { href: "/", label: "Agents", icon: Users },
]

// Mobile Navigation Sheet Component
function MobileNavSheet({ isMounted }: { isMounted: boolean }) {
  const [open, setOpen] = useState(false)

  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 hover:bg-muted"
        disabled
        aria-hidden="true"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-lg font-bold">
            Homz
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 py-6">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto pt-4 border-t">
          <div className="px-4 py-2 text-sm text-muted-foreground">
            © 2024 Homz. All rights reserved.
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { setFiltersOpen } = useSearch()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)

  // Prevent hydration mismatch by only rendering expanded search after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close expanded search when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement
      if (isSearchExpanded && !target.closest('.search-container')) {
        setIsSearchExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSearchExpanded])

  // Focus input when search expands
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchExpanded])

  return (
    <>
      <header className="border-b border-border bg-white sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4">
          {/* Mobile: Search first, then logo+nav */}
          <div className="flex flex-col gap-3 sm:hidden">
            {/* Mobile Search Bar - Always visible on top */}
            <div className="flex items-center gap-2 rounded-full border border-border bg-white shadow-md px-4 py-2.5">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                ref={mobileInputRef}
                placeholder="Search properties..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:outline-none placeholder:text-muted-foreground text-sm h-auto p-0 flex-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Logo and Nav Trigger row */}
            <div className="flex items-center justify-between gap-2">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/kjk.webp"
                  alt="Homz"
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain"
                  priority
                />
              </Link>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFiltersOpen(true)}
                  className="h-9 w-9 hover:bg-muted"
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span className="sr-only">Filters</span>
                </Button>
                <MobileNavSheet isMounted={isMounted} />
              </div>
            </div>
          </div>

          {/* Desktop: Logo + Nav + Search */}
          <div className="hidden sm:flex sm:flex-row sm:items-center gap-4">
            {/* Logo */}
            <div className="flex items-center justify-start gap-2 flex-shrink-0">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/kjk.webp"
                  alt="Homz"
                  width={140}
                  height={45}
                  className="h-10 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Navigation Items */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Airbnb-style Search Button */}
            <div className="flex-1 justify-center search-container">
              <div
                className={`relative flex items-center cursor-pointer transition-all duration-300 ${
                  isSearchExpanded ? "w-full max-w-2xl shadow-lg" : "w-auto shadow-md"
                } rounded-full bg-white border border-border hover:shadow-lg`}
                onClick={() => setIsSearchExpanded(true)}
              >
                {/* Collapsed State - Airbnb Pill */}
                {!isSearchExpanded && (
                  <>
                    {isMounted ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key="collapsed"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-between px-4 py-2.5 w-full"
                        >
                          <span className="text-sm font-medium text-foreground">Anywhere</span>
                          <div className="h-4 w-[1px] bg-border mx-2" />
                          <span className="text-sm font-medium text-foreground">Any week</span>
                          <div className="h-4 w-[1px] bg-border mx-2" />
                          <span className="text-sm text-muted-foreground">Add guests</span>
                          <div className="ml-3 bg-[#f20051] rounded-full p-1.5">
                            <Search className="h-3.5 w-3.5 text-white" />
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <div className="flex items-center justify-between px-4 py-2.5 w-full">
                        <span className="text-sm font-medium text-foreground">Anywhere</span>
                        <div className="h-4 w-[1px] bg-border mx-2" />
                        <span className="text-sm font-medium text-foreground">Any week</span>
                        <div className="h-4 w-[1px] bg-border mx-2" />
                        <span className="text-sm text-muted-foreground">Add guests</span>
                        <div className="ml-3 bg-[#f20051] rounded-full p-1.5">
                          <Search className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Expanded State - Full Search Bar - Only render after mount to prevent hydration issues */}
                {isMounted && isSearchExpanded && (
                  <AnimatePresence>
                    <motion.div
                      key="expanded"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "100%" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex items-center w-full"
                    >
                      <div className="flex items-center gap-2 px-4 py-2.5 w-full">
                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <Input
                          ref={searchInputRef}
                          placeholder="Search properties..."
                          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:outline-none placeholder:text-muted-foreground text-sm h-auto p-0 flex-1"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsSearchExpanded(false)
                          }}
                          className="p-1.5 bg-muted rounded-full transition-colors"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(true)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}

