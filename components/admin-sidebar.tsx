'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Sun,
  Eye,
  LogOut,
  List,
  FileText,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(true);
  const [openAccordions, setOpenAccordions] = React.useState<string[]>(['listings', 'applications']);

  // Ensure component is mounted before accessing theme
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Get user data from auth context or use defaults
  const userEmail = user?.email || 'admin@homehub.com';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin User';
  const userInitials = user?.email
    ? user.email
        .split('@')[0]
        .split('.')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'AD'
    : 'AD';

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/dashboard',
      active: pathname === '/dashboard',
    },
  ];

  const listingMenuItems = [
    {
      icon: Eye,
      label: 'View Listings',
      path: '/dashboard/listings',
      active: pathname === '/dashboard/listings',
    },
  ];

  const applicationMenuItems = [
    {
      icon: Eye,
      label: 'View Applications',
      path: '/dashboard/applications',
      active: pathname === '/dashboard/applications',
    },
  ];

  const isListingActive = pathname.startsWith('/dashboard/listings');
  const isApplicationActive = pathname.startsWith('/dashboard/applications');

  const handleNavigation = (path: string) => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

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
          bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 z-50 text-gray-900
          
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
                          item.active ? 'bg-primary/10 text-primary' : 'text-gray-600'
                        }`}
                        variant="ghost"
                      >
                        <item.icon
                          className={`mr-2 h-5 w-5 ${
                            item.active ? 'text-primary' : 'text-gray-500'
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
                                item.active ? 'bg-primary/10 text-primary' : ''
                              }`}
                            >
                              <item.icon
                                className={`h-5 w-5 ${
                                  item.active ? 'text-primary' : 'text-gray-500'
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

              {/* Listings Menu */}
              <li>
                {isOpen ? (
                  <div className="mt-2">
                    <Accordion 
                      type="multiple" 
                      className="w-full" 
                      value={openAccordions}
                      onValueChange={setOpenAccordions}
                    >
                      <AccordionItem value="listings" className="border-none">
                        <AccordionTrigger
                          className={`px-3 py-2 min-h-[48px] hover:bg-gray-100 rounded-lg ${
                            isListingActive ? 'text-primary' : 'text-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <List
                              className={`h-5 w-5 ${
                                isListingActive
                                  ? 'text-primary'
                                  : 'text-gray-500'
                              }`}
                            />
                            <span>Listings</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-4 space-y-1 pb-2">
                          {listingMenuItems.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              className="block"
                              href={subItem.path}
                              onClick={() => handleNavigation(subItem.path)}
                            >
                              <Button
                                className={`w-full justify-start bg-transparent text-sm ${
                                  subItem.active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-600'
                                }`}
                                size="sm"
                                variant="ghost"
                              >
                                <subItem.icon
                                  className={`mr-2 h-4 w-4 ${
                                    subItem.active
                                      ? 'text-primary'
                                      : 'text-gray-500'
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
                              isListingActive
                                ? 'bg-primary/10 text-primary'
                                : ''
                            }`}
                          >
                            <List
                              className={`h-5 w-5 ${
                                isListingActive
                                  ? 'text-primary'
                                  : 'text-gray-500'
                              }`}
                            />
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="px-1 py-2">
                          <div className="text-sm font-bold">Listings</div>
                          <div className="text-xs space-y-1 mt-1">
                            {listingMenuItems.map((subItem, subIndex) => (
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

              {/* Applications Menu */}
              <li>
                {isOpen ? (
                  <div className="mt-2">
                    <Accordion 
                      type="multiple" 
                      className="w-full" 
                      value={openAccordions}
                      onValueChange={setOpenAccordions}
                    >
                      <AccordionItem value="applications" className="border-none">
                        <AccordionTrigger
                          className={`px-3 py-2 min-h-[48px] hover:bg-gray-100 rounded-lg ${
                            isApplicationActive ? 'text-primary' : 'text-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <FileText
                              className={`h-5 w-5 ${
                                isApplicationActive
                                  ? 'text-primary'
                                  : 'text-gray-500'
                              }`}
                            />
                            <span>Applications</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-4 space-y-1 pb-2">
                          {applicationMenuItems.map((subItem, subIndex) => (
                            <Link
                              key={subIndex}
                              className="block"
                              href={subItem.path}
                              onClick={() => handleNavigation(subItem.path)}
                            >
                              <Button
                                className={`w-full justify-start bg-transparent text-sm ${
                                  subItem.active
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-gray-600'
                                }`}
                                size="sm"
                                variant="ghost"
                              >
                                <subItem.icon
                                  className={`mr-2 h-4 w-4 ${
                                    subItem.active
                                      ? 'text-primary'
                                      : 'text-gray-500'
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
                              isApplicationActive
                                ? 'bg-primary/10 text-primary'
                                : ''
                            }`}
                          >
                            <FileText
                              className={`h-5 w-5 ${
                                isApplicationActive
                                  ? 'text-primary'
                                  : 'text-gray-500'
                              }`}
                            />
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="px-1 py-2">
                          <div className="text-sm font-bold">Applications</div>
                          <div className="text-xs space-y-1 mt-1">
                            {applicationMenuItems.map((subItem, subIndex) => (
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

        </div>

        {/* Light Mode Indicator (no toggle) */}
        <div className="px-2 mb-4">
          {isOpen ? (
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100">
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium text-gray-700">
                  Light Mode
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden lg:block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-full">
                    <Sun className="h-5 w-5 text-amber-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Light Mode</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        <Separator />

        {/* User Profile */}
        <div className="p-4">
          {isOpen ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                    <span className="text-sm font-medium">{userInitials}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium truncate">{userName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {userEmail}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-gray-500">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden lg:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mx-auto cursor-pointer hover:opacity-80 transition-opacity">
                    <span className="text-sm font-medium">{userInitials}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-gray-500">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;

