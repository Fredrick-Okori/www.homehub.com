import React from 'react'
import AdminSidebar from '@/components/admin-sidebar'
import { DashboardHeader } from '@/components/dashboard-header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden">
            <AdminSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}

