"use client"

import { Footer } from "@/components/footer"
import type React from "react"
import { Header } from "@/components/header"
import { SearchProvider } from "@/components/search-context"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <SearchProvider>
      <Header />
      {children}
      <Footer />
    </SearchProvider>
  )
}

