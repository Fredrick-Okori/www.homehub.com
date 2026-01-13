"use client"

import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Search,
  Bell,
  Menu,
  User,
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface AdminHeaderProps {
  onMenuClick?: () => void
  className?: string
}

export function AdminHeader({ onMenuClick, className }: AdminHeaderProps) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New property application",
      description: "John Doe applied for Downtown Loft",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "Property status updated",
      description: "Beachfront Luxury Condo is now active",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "New message",
      description: "You have a new inquiry about Mountain Cabin",
      time: "3 hours ago",
      unread: false,
    },
  ])

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur px-4 lg:px-6",
        className
      )}
    >
      {/* Mobile Menu Button */}
      {onMenuClick && (
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      )}

      {/* Search Bar */}
      <div className="flex-1 flex items-center justify-end lg:justify-start">
        <div className="relative w-full max-w-md">
          {searchOpen ? (
            <div className="absolute inset-0 flex items-center lg:static">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-zinc-500" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full rounded-lg bg-zinc-800/50 border-zinc-700 pl-10 pr-8 focus-visible:bg-zinc-800 focus-visible:border-zinc-600 text-white placeholder:text-zinc-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 h-7 w-7 text-zinc-400 hover:text-white"
                  onClick={() => {
                    setSearchOpen(false)
                    setSearchQuery("")
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">Search...</span>
              <span className="lg:hidden">Search...</span>
              <kbd className="ml-auto hidden sm:flex h-5 select-none items-center gap-1 rounded border bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-400 opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          )}
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="default"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-white text-black"
                >
                  {unreadCount}
                </Badge>
              )}
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-zinc-800">
            <DropdownMenuLabel className="flex items-center justify-between text-white">
              Notifications
              <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-zinc-400 hover:text-white">
                Mark all as read
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex flex-col items-start gap-1 p-3 focus:bg-zinc-800"
                >
                  <div className="flex items-center gap-2 w-full">
                    {notification.unread && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                    <span className="font-medium text-white">{notification.title}</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    {notification.description}
                  </p>
                  <span className="text-xs text-zinc-500">
                    {notification.time}
                  </span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-zinc-400">
                No notifications
              </div>
            )}
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem asChild>
              <Link
                href="/admin/dashboard/notifications"
                className="w-full cursor-pointer text-center text-white hover:bg-zinc-800"
              >
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-9 gap-2 text-zinc-300 hover:text-white hover:bg-zinc-800">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
                <AvatarFallback className="bg-zinc-800 text-xs text-white">
                  A
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline font-medium text-sm">
                Admin
              </span>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
            <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard/profile" className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard/settings" className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard/help" className="cursor-pointer text-zinc-300 focus:bg-zinc-800 focus:text-white">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help & Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem className="cursor-pointer text-red-400 focus:bg-zinc-800 focus:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

