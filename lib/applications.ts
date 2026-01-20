/**
 * Utility functions for managing applications in Supabase
 */

import { createClient } from '@/lib/supabase/client';

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

    // Get profile - profile.id should match auth.users.id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Don't hard-fail here – just log a concise warning and fall back to null
      console.warn('Profile not found for user (updateApplicationStatus will use updated_by = null):', user.id);
      return null;
    }

    return profile.id;
  } catch (error) {
    console.error('Error getting profile ID:', error);
    return null;
  }
}

export interface Application {
  id: string;
  listing_id: string;
  surname: string;
  given_name: string;
  current_address: string;
  work_address: string | null;
  work_phone: string | null;
  email: string;
  mobile_number: string;
  mobile_registered_name: string;
  nin_number: string | null;
  card_number: string | null;
  passport_number: string | null;
  national_id_front_url: string | null;
  national_id_back_url: string | null;
  passport_photo_url: string | null;
  passport_particulars_url: string | null;
  applicant_photo_url: string | null;
  employment_contract_url: string | null;
  employer_name: string | null;
  next_of_kin_name: string;
  next_of_kin_number: string;
  status: 'pending' | 'approved' | 'rejected';
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Update application status and set updated_by
 * @param applicationId The application ID
 * @param status The new status ('approved' or 'rejected')
 * @param adminProfileId Optional admin's profile ID (will be fetched if not provided)
 * @returns Promise<boolean> - true if successful
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: 'approved' | 'rejected',
  adminProfileId?: string
): Promise<boolean> {
  try {
    const supabase = createClient();

    // Get admin profile ID if not provided (used for updated_by).
    // If there is no profile we still try to update the application with updated_by = null.
    let profileId = adminProfileId;
    if (!profileId) {
      profileId = await getProfileId();
    }

    // First, update the application status
    const { error: appError } = await supabase
      .from('applications')
      .update({
        status,
        updated_by: profileId ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (appError) {
      console.error('Error updating application status:', appError);
      // Log more details for debugging
      if (appError.code === '42501') {
        console.error('RLS Policy Error: Admin access denied. Check if is_admin() function works correctly.');
      }
      return false;
    }

    // If approved, also update the related listing so it no longer shows on the client side
    if (status === 'approved') {
      try {
        // Get the listing_id for this application (we already have it from the application object, but fetch to be sure)
        const { data: appRow, error: fetchError } = await supabase
          .from('applications')
          .select('listing_id')
          .eq('id', applicationId)
          .single();

        if (fetchError || !appRow) {
          console.error('Error fetching application listing_id for status update:', fetchError);
          // Don't fail the whole operation, but log it
        } else {
          const listingId = appRow.listing_id as string;
          console.log('Updating listing status to "taken" for listing:', listingId);

          // Update the listing status so it won't appear in public listings (which use status = "available")
          const { data: updatedListing, error: listingError } = await supabase
            .from('listings')
            .update({
              status: 'taken', // Client filters for status = 'available', so 'taken' will be hidden
              updated_at: new Date().toISOString(),
            })
            .eq('id', listingId)
            .select();

          if (listingError) {
            console.error('Error updating listing status after application approval:', listingError);
            console.error('Listing error details:', {
              code: listingError.code,
              message: listingError.message,
              details: listingError.details,
              hint: listingError.hint,
            });
            // If RLS is blocking, this will help identify it
            if (listingError.code === '42501') {
              console.error('RLS Policy Error: Admin does not have permission to update listings. Check listings RLS policies.');
            }
          } else {
            console.log('Successfully updated listing status to "taken":', updatedListing);
          }
        }
      } catch (innerError) {
        console.error('Unexpected error updating listing status after approval:', innerError);
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating application status:', error);
    return false;
  }
}

/**
 * Get all applications (for admin)
 * @returns Promise<Application[]>
 */
export async function getAllApplications(): Promise<Application[]> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

/**
 * Get application by ID
 * @param applicationId The application ID
 * @returns Promise<Application | null>
 */
export async function getApplicationById(applicationId: string): Promise<Application | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (error) {
      console.error('Error fetching application:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching application:', error);
    return null;
  }
}

