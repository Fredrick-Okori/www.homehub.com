import type React from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchProvider } from "@/components/search-context"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <LayoutWrapper>
      <SearchProvider>
        <Header />
        {children}
        <Footer />
      </SearchProvider>
    </LayoutWrapper>
  )
}

