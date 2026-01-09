"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface SearchContextType {
  searchTerm: string
  setSearchTerm: (term: string) => void
  filtersOpen: boolean
  setFiltersOpen: (open: boolean) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filtersOpen, setFiltersOpen] = useState(false)

  const handleSetSearchTerm = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const handleSetFiltersOpen = useCallback((open: boolean) => {
    setFiltersOpen(open)
  }, [])

  return (
    <SearchContext.Provider
      value={{
        searchTerm,
        setSearchTerm: handleSetSearchTerm,
        filtersOpen,
        setFiltersOpen: handleSetFiltersOpen,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}

