'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

import {
  LayoutDashboard,
  Ticket,
  Calendar,
  MapPin,
  Users,
  BarChart,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils'; // Ensure you have this utility

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onToggle }) => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 1. Handle Hydration and Persistence
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('sidebar-expanded');
    // If we have a saved state and it differs from current, sync it
    // Note: This assumes the parent component also reads from localStorage or allows this sync
    if (saved !== null) {
      const isExpanded = JSON.parse(saved);
      if (isExpanded !== isOpen) {
        onToggle(); 
      }
    }
  }, []);

  const handleToggle = () => {
    localStorage.setItem('sidebar-expanded', JSON.stringify(!isOpen));
    onToggle();
  };

  if (!mounted) return null;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Ticket, label: 'Tickets', path: '/admin/tickets' },
    { icon: Calendar, label: 'Events', path: '/admin/events' },
    { icon: MapPin, label: 'Venues', path: '/admin/venues' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: BarChart, label: 'Analytics', path: '/admin/analytics' },
  ];

  const organizationMenuItems = [
    { icon: Settings, label: 'General', path: '/admin/organization/general' },
    { icon: Users, label: 'Team', path: '/admin/organization/team' },
  ];

  const isOrganizationActive = pathname.startsWith('/admin/organization');

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
          onClick={handleToggle}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[70] flex flex-col bg-background border-r border-border transition-all duration-300 ease-in-out lg:sticky lg:top-0 h-screen",
          isOpen ? "w-64 translate-x-0" : "w-16 -translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-4 shrink-0 overflow-hidden">
          {isOpen && (
            <Link href="/admin/dashboard" className="flex-1 truncate">
          
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            className={cn("shrink-0", !isOpen && "mx-auto hidden lg:flex")}
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
          {/* Mobile close button (only visible when open on mobile) */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={handleToggle}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 custom-scrollbar">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <div key={item.path}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={item.path} onClick={() => window.innerWidth < 1024 && handleToggle()}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-3",
                            isActive && "bg-primary/10 text-primary hover:bg-primary/15",
                            !isOpen && "justify-center px-0"
                          )}
                        >
                          <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                          {isOpen && <span className="truncate">{item.label}</span>}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    {!isOpen && <TooltipContent side="right">{item.label}</TooltipContent>}
                  </Tooltip>
                </div>
              );
            })}

            {/* Organization Section */}
            <div className="pt-2">
              {isOpen ? (
                <Accordion type="single" collapsible defaultValue={isOrganizationActive ? "org" : undefined}>
                  <AccordionItem value="org" className="border-none">
                    <AccordionTrigger className="py-2 px-3 hover:no-underline hover:bg-accent rounded-md transition-none">
                      <div className="flex items-center gap-3">
                        <Building2 className={cn("h-5 w-5", isOrganizationActive ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-sm font-medium">Organisation</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 pb-0 pl-4 space-y-1">
                      {organizationMenuItems.map((sub) => (
                        <Link key={sub.path} href={sub.path} onClick={() => window.innerWidth < 1024 && handleToggle()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start gap-3",
                              pathname === sub.path ? "text-primary bg-primary/5" : "text-muted-foreground"
                            )}
                          >
                            <sub.icon className="h-4 w-4" />
                            {sub.label}
                          </Button>
                        </Link>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={isOrganizationActive ? "secondary" : "ghost"} className="w-full justify-center px-0">
                      <Building2 className={cn("h-5 w-5", isOrganizationActive ? "text-primary" : "text-muted-foreground")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Organisation</TooltipContent>
                </Tooltip>
              )}
            </div>
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-3 mt-auto space-y-4">
          <Separator />
          
          {/* Theme Toggle */}
          <div className={cn("flex items-center", isOpen ? "justify-between px-2" : "justify-center")}>
            {isOpen && (
              <div className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="text-sm font-medium">Dark Mode</span>
              </div>
            )}
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
          </div>

          {/* User Profile */}
          <div className={cn("flex items-center gap-3 p-2 rounded-lg bg-accent/50", !isOpen && "justify-center p-1")}>
            <div className="h-8 w-8 shrink-0 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              AD
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">Admin User</p>
                <p className="text-[10px] text-muted-foreground truncate">admin@homehub.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default AdminSidebar;