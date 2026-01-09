"use client"

import Link from "next/link"
import { Search, MapPin, Home, Building2, Key, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSearch } from "@/components/search-context"

const navItems = [
  { href: "/", label: "Buy", icon: Home },
  { href: "/", label: "Rent", icon: Building2 },
  { href: "/", label: "Sell", icon: Key },
  { href: "/", label: "Agents", icon: Users },
]

export function Header() {
  const { searchTerm, setSearchTerm, filtersOpen, setFiltersOpen } = useSearch()

  return (
    <header className="border-b border-border bg-white sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-2xl font-bold text-foreground">
              Home<span className="text-primary">Hub</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2 rounded-full border border-border bg-white shadow-md px-4 py-3 hover:shadow-lg transition-shadow">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <Input
                placeholder="Search locations..."
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:outline-none placeholder:text-muted-foreground text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </div>
          </div>

          {/* Filters Button */}
          <Button
            onClick={() => setFiltersOpen(true)}
            variant="outline"
            className="flex items-center gap-2 rounded-full px-6 bg-white hover:bg-secondary text-foreground border border-border"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
          </Button>
        </div>
      </div>
    </header>
  )
}

