

import { createClient } from '@/lib/supabase/client';

// Types for dashboard data
export interface DashboardStats {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  takenListings: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalRevenue: number;
  avgDaysOnMarket: number;
}

export interface RecentListing {
  id: string;
  title: string;
  status: string;
  created_at: string;
  price: number | null;
  location: string | null;
}

export interface RecentApplication {
  id: string;
  listing_id: string;
  surname: string;
  given_name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

/**
 * Fetch dashboard statistics from Supabase
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient();

  try {
    // Fetch listings count by status
    const { data: listings } = await supabase
      .from('listings')
      .select('status');

    const listingsArray = listings || [];
    const totalListings = listingsArray.length;
    const activeListings = listingsArray.filter(l => l.status === 'available').length;
    const pendingListings = listingsArray.filter(l => l.status === 'pending').length;
    const soldListings = listingsArray.filter(l => l.status === 'sold').length;
    const takenListings = listingsArray.filter(l => l.status === 'taken').length;

    // Fetch applications count by status
    const { data: applications } = await supabase
      .from('applications')
      .select('status');

    const applicationsArray = applications || [];
    const totalApplications = applicationsArray.length;
    const pendingApplications = applicationsArray.filter(a => a.status === 'pending').length;
    const approvedApplications = applicationsArray.filter(a => a.status === 'approved').length;
    const rejectedApplications = applicationsArray.filter(a => a.status === 'rejected').length;

    return {
      totalListings,
      activeListings,
      pendingListings,
      soldListings,
      takenListings,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalRevenue: 2450000, // Placeholder - would need revenue table
      avgDaysOnMarket: 18, // Placeholder - would need to calculate from listing data
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return defaults on error
    return getDefaultStats();
  }
}

/**
 * Fetch recent listings
 */
export async function getRecentListings(limit: number = 5): Promise<RecentListing[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, status, created_at, description')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent listings:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      status: item.status,
      created_at: item.created_at,
      price: null,
      location: null,
    }));
  } catch (error) {
    console.error('Error fetching recent listings:', error);
    return [];
  }
}

/**
 * Fetch recent applications
 */
export async function getRecentApplications(limit: number = 5): Promise<RecentApplication[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('applications')
      .select('id, listing_id, surname, given_name, email, status, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent applications:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      listing_id: item.listing_id,
      surname: item.surname,
      given_name: item.given_name,
      email: item.email,
      status: item.status as 'pending' | 'approved' | 'rejected',
      created_at: item.created_at,
    }));
  } catch (error) {
    console.error('Error fetching recent applications:', error);
    return [];
  }
}

/**
 * Get default stats when data fetch fails
 */
function getDefaultStats(): DashboardStats {
  return {
    totalListings: 0,
    activeListings: 0,
    pendingListings: 0,
    soldListings: 0,
    takenListings: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalRevenue: 0,
    avgDaysOnMarket: 0,
  };
}

/**
 * Format number with currency
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
}

