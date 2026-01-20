/**
 * Utility functions for managing likes in Supabase
 */

import { createClient } from '@/lib/supabase/client';

export interface Like {
  id: string;
  listing_id: string;
  user_id: string;
  created_at: string;
}

/**
 * Get profile ID for the current authenticated user
 * @returns Promise<string | null> - Profile ID or null if not authenticated/no profile
 */
async function getProfileId(): Promise<string | null> {
  try {
    const supabase = createClient();
    
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return null;
    }

    // Try to get profile - profile.id should match auth.users.id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // If profile doesn't exist, return null (user_id will be null in likes table)
    if (profileError || !profile) {
      console.warn('Profile not found for user:', user.id, 'Likes will be saved with user_id = null');
      return null;
    }

    return profile.id;
  } catch (error) {
    console.error('Error getting profile ID:', error);
    return null;
  }
}

/**
 * Toggle like for a listing
 * Works for both authenticated users and anonymous users (no account required)
 * @param listingId The listing ID to like/unlike
 * @param profileId The profile ID (optional, will get from auth if not provided, can be null for anonymous)
 * @returns Promise<boolean> - true if liked, false if unliked
 */
export async function toggleLike(listingId: string, profileId?: string | null): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Get profile ID if not provided (will be null for anonymous users)
    if (profileId === undefined) {
      profileId = await getProfileId();
      // profileId can be null - this means anonymous like (no account required)
    }

    // Check if like already exists (only for authenticated users with profile)
    // Anonymous users (profileId = null) can't be tracked, so each click adds a new like
    let existingLike = null;
    if (profileId) {
      const { data, error: checkError } = await supabase
        .from('likes')
        .select('id')
        .eq('listing_id', listingId)
        .eq('user_id', profileId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking like:', checkError);
        throw checkError;
      }
      existingLike = data;
    }
    
    // For anonymous users (profileId = null), we can't check for existing likes
    // Each click will add a new like (this is expected behavior for anonymous users)

    if (existingLike && profileId) {
      // Unlike - delete the like (only for authenticated users)
      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('listing_id', listingId)
        .eq('user_id', profileId);

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        throw deleteError;
      }

      return false; // Unliked
    } else {
      // Like - insert new like
      // user_id will be null for anonymous users (no account required)
      const insertData: { listing_id: string; user_id: string | null } = {
        listing_id: listingId,
        user_id: profileId || null, // null for anonymous users
      };

      const { data: insertData_result, error: insertError } = await supabase
        .from('likes')
        .insert(insertData)
        .select();

      if (insertError) {
        console.error('Error adding like:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
          listingId: listingId,
          profileId: profileId,
          fullError: insertError
        });
        // Provide more specific error messages
        if (insertError.code === '23503') {
          throw new Error('Invalid listing. Please try again.');
        } else if (insertError.code === '23505') {
          throw new Error('You have already liked this listing.');
        } else if (insertError.code === '42501') {
          throw new Error('Permission denied. Please check RLS policies.');
        }
        throw new Error(insertError.message || 'Failed to add like. Please try again.');
      }

      return true; // Liked
    }
  } catch (error: any) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

/**
 * Get all likes for a user
 * @param profileId The profile ID (optional, will get from auth if not provided, can be null)
 * @returns Promise<string[]> - Array of listing IDs that the user has liked
 */
export async function getUserLikes(profileId?: string | null): Promise<string[]> {
  try {
    const supabase = createClient();
    
    // Get profile ID if not provided
    if (profileId === undefined) {
      profileId = await getProfileId();
      // If no profile, return empty array (can't track anonymous likes per user)
      if (!profileId) {
        return [];
      }
    }

    // If profileId is null, return empty array (can't query anonymous likes)
    if (!profileId) {
      return [];
    }

    const { data, error } = await supabase
      .from('likes')
      .select('listing_id')
      .eq('user_id', profileId);

    if (error) {
      console.error('Error fetching user likes:', error);
      return [];
    }

    return data?.map((like) => like.listing_id) || [];
  } catch (error) {
    console.error('Error getting user likes:', error);
    return [];
  }
}

/**
 * Get like count for a listing
 * @param listingId The listing ID
 * @returns Promise<number> - Number of likes
 */
export async function getLikeCount(listingId: string): Promise<number> {
  try {
    const supabase = createClient();
    
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listingId);

    if (error) {
      console.error('Error getting like count:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        listingId: listingId,
        error: error
      });
      return 0;
    }

    return count || 0;
  } catch (error: any) {
    console.error('Error getting like count:', {
      message: error?.message,
      stack: error?.stack,
      listingId: listingId,
      error: error
    });
    return 0;
  }
}

/**
 * Get like counts for multiple listings
 * @param listingIds Array of listing IDs
 * @returns Promise<Map<string, number>> - Map of listing ID to like count
 */
export async function getLikeCounts(listingIds: string[]): Promise<Map<string, number>> {
  try {
    const supabase = createClient();
    
    if (listingIds.length === 0) {
      return new Map();
    }

    // Initialize counts map with all listing IDs set to 0
    const counts = new Map<string, number>();
    listingIds.forEach((id) => counts.set(id, 0));

    // Query likes table - use a more permissive query that works with RLS
    const { data, error } = await supabase
      .from('likes')
      .select('listing_id')
      .in('listing_id', listingIds);

    if (error) {
      console.error('Error getting like counts:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        error: error
      });
      // Return counts map with all zeros if there's an error
      return counts;
    }

    // Count likes per listing
    if (data && data.length > 0) {
      data.forEach((like) => {
        if (like.listing_id) {
          const current = counts.get(like.listing_id) || 0;
          counts.set(like.listing_id, current + 1);
        }
      });
    }

    return counts;
  } catch (error: any) {
    console.error('Error getting like counts:', {
      message: error?.message,
      stack: error?.stack,
      error: error
    });
    // Return empty map with all listing IDs initialized to 0
    const counts = new Map<string, number>();
    listingIds.forEach((id) => counts.set(id, 0));
    return counts;
  }
}

