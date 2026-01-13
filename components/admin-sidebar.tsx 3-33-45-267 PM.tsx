"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// CRUD-aligned navigation structure
const mainNavItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
]

const propertyNavItems = [
  { name: "Properties", href: "/admin/dashboard/properties", icon: Building2 },
  { name: "Add New", href: "/admin/dashboard/properties/new", icon: Building2 },
]

const managementNavItems = [
  { name: "Applications", href: "/admin/dashboard/applications", icon: FileText },
  { name: "Team", href: "/admin/dashboard/team", icon: Users },
]

const systemNavItems = [
  { name: "Analytics", href: "/admin/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/dashboard/settings", icon: Settings },
]

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  const [collapsed, setCollapsed] = useState(false)

  const NavGroup = ({
    title,
    items,
  }: {
    title: string
    items: { name: string; href: string; icon: React.ElementType }[]
  }) => (
    <div className="mb-6">
      {!collapsed && (
        <h3 className="px-3 mb-2 text-[10px] font-medium uppercase tracking-widest text-zinc-500">
          {title}
        </h3>
      )}
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                isActive
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800",
                collapsed && "justify-center"
              )}
            >
              <item.icon
                className={cn("h-4 w-4 shrink-0", isActive ? "text-black" : "text-zinc-400")}
              />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>
    </div>
  )

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Logo Area */}
      <div className="flex items-center h-14 px-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
            <Building2 className="h-4 w-4 text-black" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm tracking-tight text-white">
              HomeHub
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <NavGroup title="Overview" items={mainNavItems} />
        <NavGroup title="Properties" items={propertyNavItems} />
        <NavGroup title="Management" items={managementNavItems} />
        <NavGroup title="System" items={systemNavItems} />
      </div>

      {/* Footer */}
      <div className="p-3 mt-auto border-t border-zinc-800">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback className="bg-zinc-800 text-xs text-white">A</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">Admin</p>
              <button className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1 transition-colors">
                <LogOut className="h-3 w-3" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-14 h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-400"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>
    </aside>
  )
}

