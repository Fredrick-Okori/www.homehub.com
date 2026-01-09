"use client"

import Link from "next/link"
import { Search, MapPin, Home, Building2, Key, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearch } from "@/components/search-context"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/", label: "Buy", icon: Home },
  { href: "/", label: "Rent", icon: Building2 },
  { href: "/", label: "Sell", icon: Key },
  { href: "/", label: "Agents", icon: Users },
]

export function Header() {
  const { searchTerm, setSearchTerm, filtersOpen, setFiltersOpen } = useSearch()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileInputRef = useRef<HTMLInputElement>(null)

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
          {/* Mobile: Search first, then logo+filters */}
          <div className="flex flex-col gap-3 sm:hidden">
            {/* Mobile Search Bar - Always visible on top */}
            <div className="flex items-center gap-2 rounded-full border border-border bg-white shadow-md px-4 py-2.5">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                ref={mobileInputRef}
                placeholder="Search locations..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:outline-none placeholder:text-muted-foreground text-sm h-auto p-0 flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                onClick={() => setFiltersOpen(true)}
                className="p-1.5 bg-muted rounded-full"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
              </button>
            </div>
            
            {/* Logo and Filters row */}
            <div className="flex items-center justify-between gap-2">
              <div className="text-xl font-bold text-foreground">
                Home<span className="text-primary">Hub</span>
              </div>
              <Button
                onClick={() => setFiltersOpen(true)}
                variant="outline"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-secondary text-foreground border border-border h-8"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <span className="text-xs">Filters</span>
              </Button>
            </div>
          </div>

          {/* Desktop: Logo + Nav + Search + Filters */}
          <div className="hidden sm:flex sm:flex-row sm:items-center gap-4">
            {/* Logo */}
            <div className="flex items-center justify-start gap-2 flex-shrink-0">
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                Home<span className="text-primary">Hub</span>
              </div>
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
                <AnimatePresence mode="wait">
                  {!isSearchExpanded && (
                    <motion.div
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
                  )}
                </AnimatePresence>

                {/* Expanded State - Full Search Bar */}
                <AnimatePresence>
                  {isSearchExpanded && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "100%" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="flex items-center w-full"
                    >
                      <div className="flex items-center gap-2 px-4 py-2.5 w-full">
                        <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <Input
                          ref={searchInputRef}
                          placeholder="Search locations..."
                          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:outline-none placeholder:text-muted-foreground text-sm h-auto p-0 flex-1"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsSearchExpanded(false)
                          }}
                          className="p-1 hover:bg-muted rounded-full transition-colors"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Desktop Filters Button */}
            <Button
              onClick={() => setFiltersOpen(true)}
              variant="outline"
              className="flex items-center gap-2 rounded-full px-4 lg:px-6 bg-white hover:bg-secondary text-foreground border border-border"
            >
              <svg className="h-4 sm:h-5 w-4 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="text-sm">Filters</span>
            </Button>
          </div>
        </div>
      </header>
    </>
  )
}

