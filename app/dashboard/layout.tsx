'use client';

import React, { useEffect } from 'react'
import { useTheme } from 'next-themes'
import AdminSidebar from '@/components/admin-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setTheme, theme } = useTheme()

  // Force light mode for dashboard
  useEffect(() => {
    if (theme !== 'light') {
      setTheme('light')
    }
  }, [setTheme, theme])

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}

