'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import {
  LayoutDashboard,
  Home,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  BarChart,
  Settings,
  HelpCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Eye,
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
import { SheetTitle } from './ui/sheet';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(true);
  const [openAccordions, setOpenAccordions] = React.useState<string[]>(['organization']);

  // Ensure component is mounted before accessing theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Mock user data (replace with real session data if available)
  const userInitials = 'AD'; // Admin
  const userName = 'Admin User';
  const userEmail = 'admin@homehub.com';

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      icon: Home,
      label: 'Properties',
      path: '/dashboard/properties',
      active: pathname === '/dashboard/properties',
    },
    {
      icon: Eye,
      label: 'Applications',
      path: '/dashboard/applications',
      active: pathname === '/dashboard/applications',
    },
    {
      icon: Users,
      label: 'Customers',
      path: '/dashboard/customers',
      active: pathname === '/dashboard/customers',
    },
    {
      icon: BarChart,
      label: 'Analytics',
      path: '/dashboard/analytics',
      active: pathname === '/dashboard/analytics',
    },
  ];

  const propertyMenuItems = [
    {
      icon: Plus,
      label: 'Add Listing',
      path: '/dashboard/properties/create',
      active: pathname === '/dashboard/properties/create',
      description: 'Create new property listing',
    },
    {
      icon: Edit,
      label: 'Edit Listings',
      path: '/dashboard/properties/edit',
      active: pathname === '/dashboard/properties/edit',
      description: 'Edit existing properties',
    },
    {
      icon: Trash2,
      label: 'Delete Listings',
      path: '/dashboard/properties/delete',
      active: pathname === '/dashboard/properties/delete',
      description: 'Manage deleted properties',
    },
  ];

  const bottomMenuItems = [
    {
      icon: Settings,
      label: 'Settings',
      path: '/dashboard/settings',
      active: pathname === '/dashboard/settings',
    },
    {
      icon: HelpCircle,
      label: 'Help',
      path: '/dashboard/help',
      active: pathname === '/dashboard/help',
    },
  ];

  const handleNavigation = (path: string) => {
    // Auto-close on mobile after navigation
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  const toggleTheme = () => {
    if (mounted) {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

  const isPropertyActive = pathname.startsWith('/dashboard/properties');

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-content1 border-r border-divider h-screen flex flex-col transition-all duration-300 z-50
          
          /* Mobile: Fixed position, slide in/out */
          fixed lg:sticky top-0
          ${
            isOpen
              ? 'translate-x-0 w-64'
              : '-translate-x-full lg:translate-x-0 lg:w-16'
          }
          
          /* Desktop: Always visible, just width changes */
          lg:relative
        `}
      >
        <div className="flex items-center justify-between p-4">
          {isOpen && (
            <div className="flex text-bold">
            <span className='font-bold text-xl'>Home</span><span className="text-primary text-xl font-bold">Hub</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={`
              ${isOpen ? 'ml-auto' : 'mx-auto'}
              /* Hide toggle button on mobile when sidebar is closed */
              ${!isOpen ? 'hidden lg:flex' : 'flex'}
            `}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Separator />

        <div className="flex flex-col flex-1 py-4 overflow-y-auto">
          <nav className="flex-1">
            <ul className="space-y-1 px-2">
              {/* Main Menu Items */}
              {menuItems.map((item, index) => (
                <li key={index}>
                  {isOpen ? (
                    <Link
                      className="block"
                      href={item.path}
                      onClick={() => handleNavigation(item.path)}
                    >
                      <Button
                        className={`w-full justify-start bg-transparent ${
                          item.active ? 'bg-primary-100 text-primary' : ''
                        }`}
                        color={item.active ? 'primary' : 'default'}
                        variant="ghost"
                      >
                        <item.icon
                          className={`mr-2 h-5 w-5 ${
                            item.active ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        />
                        {item.label}
                      </Button>
                    </Link>
                  ) : (
                    <div className="hidden lg:block">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link className="block" href={item.path}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`w-full ${
                                item.active ? 'bg-primary-100 text-primary' : ''
                              }`}
                            >
                              <item.icon
                                className={`h-5 w-5 ${
                                  item.active ? 'text-primary' : 'text-muted-foreground'
                                }`}
                              />
                            </Button>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  )}
                </li>
              ))}

              {/* Property Management CRUD Menu */}
              <li>
                {isOpen ? (
                  <div className="mt-2">
                    <Accordion 
                      type="multiple" 
                      className="w-full" 
                      value={openAccordions}
                      onValueChange={setOpenAccordions}
                    >
                      <AccordionItem value="properties" className="border-none">
                        <AccordionTrigger
                          className={`px-3 py-2 min-h-[48px] hover:bg-accent rounded-lg ${
                            isPropertyActive ? 'text-primary' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Home
                              className={`h-5 w-5 ${
                                isPropertyActive
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            />
                            <span>Property Management</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-4 space-y-1 pb-2">
                          {propertyMenuItems.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              className="block"
                              href={subItem.path}
                              onClick={() => handleNavigation(subItem.path)}
                            >
                              <Button
                                className={`w-full justify-start bg-transparent text-sm ${
                                  subItem.active
                                    ? 'bg-primary-100 text-primary'
                                    : 'text-muted-foreground'
                                }`}
                                color={subItem.active ? 'primary' : 'default'}
                                size="sm"
                                variant="ghost"
                              >
                                <subItem.icon
                                  className={`mr-2 h-4 w-4 ${
                                    subItem.active
                                      ? 'text-primary'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                                {subItem.label}
                              </Button>
                            </Link>
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ) : (
                  <div className="hidden lg:block mt-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`w-full ${
                              isPropertyActive
                                ? 'bg-primary-100 text-primary'
                                : ''
                            }`}
                          >
                            <Home
                              className={`h-5 w-5 ${
                                isPropertyActive
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="px-1 py-2">
                          <div className="text-sm font-bold">Property Management</div>
                          <div className="text-xs space-y-1 mt-1">
                            {propertyMenuItems.map((subItem, subIndex) => (
                              <div
                                key={subIndex}
                                className="flex items-center gap-2"
                              >
                                <subItem.icon className="h-3 w-3" />
                                <span>{subItem.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </li>
            </ul>
          </nav>

          <Separator className="my-4" />

          {/* Bottom Menu Items */}
          <div className="px-2 space-y-1">
            {bottomMenuItems.map((item, index) => (
              <div key={index}>
                {isOpen ? (
                  <Link
                    className="block"
                    href={item.path}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <Button
                      className={`w-full justify-start ${
                        item.active ? 'bg-primary-100 text-primary' : ''
                      }`}
                      color={item.active ? 'primary' : 'default'}
                      variant="ghost"
                    >
                      <item.icon
                        className={`mr-2 h-5 w-5 ${
                          item.active ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      />
                      {item.label}
                    </Button>
                  </Link>
                ) : (
                  <div className="hidden lg:block">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link className="block" href={item.path}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`w-full ${
                              item.active ? 'bg-primary-100 text-primary' : ''
                            }`}
                          >
                            <item.icon
                              className={`h-5 w-5 ${
                                item.active
                                  ? 'text-primary'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </Button>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="px-2 mb-4">
          {isOpen ? (
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="text-sm font-medium text-foreground">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          ) : (
            <div className="hidden lg:block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-full"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? (
                      <Moon className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Sun className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        <Separator />

        {/* User Profile */}
        <div className="p-4">
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <span className="text-sm font-medium">{userInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          ) : (
            <div className="hidden lg:block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mx-auto cursor-pointer">
                    <span className="text-sm font-medium">{userInitials}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{userName}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;

