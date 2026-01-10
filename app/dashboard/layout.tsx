import React from 'react'
import AdminSidebar from '@/components/admin-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto bg-background">
                {children}
            </main>
        </div>
    )
}

