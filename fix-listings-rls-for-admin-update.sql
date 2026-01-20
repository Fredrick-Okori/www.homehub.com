-- ============================================
-- Fix Listings RLS Policies for Admin Updates
-- ============================================
-- This ensures admins can update listing status when applications are approved
-- ============================================

BEGIN;

-- Step 1: Ensure is_admin() function exists (same as used in applications)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO public;

-- Step 2: Check if listings table has RLS enabled
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing UPDATE policies (if any) to avoid conflicts
DROP POLICY IF EXISTS "Enable users to update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Allow admins to update listings" ON public.listings;
DROP POLICY IF EXISTS "Allow authenticated users to update listings" ON public.listings;

-- Step 4: Create UPDATE policy that allows:
--   - Users to update their own listings (created_by = auth.uid())
--   - Admins to update any listing (using is_admin() function)
CREATE POLICY "Allow users and admins to update listings"
ON public.listings
FOR UPDATE
TO authenticated
USING (
  (created_by = auth.uid())
  OR
  (public.is_admin())
)
WITH CHECK (
  (created_by = auth.uid())
  OR
  (public.is_admin())
);

-- Step 5: Ensure SELECT policy allows public to see available listings
-- (This might already exist, but we'll create it if it doesn't)
DROP POLICY IF EXISTS "Allow public to view available listings" ON public.listings;

CREATE POLICY "Allow public to view available listings"
ON public.listings
FOR SELECT
TO public
USING (status = 'available');

-- Step 6: Ensure admins can see all listings (for admin dashboard)
DROP POLICY IF EXISTS "Allow admins to view all listings" ON public.listings;

CREATE POLICY "Allow admins to view all listings"
ON public.listings
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Step 7: Grant necessary permissions
GRANT SELECT ON public.listings TO public;
GRANT SELECT ON public.listings TO authenticated;
GRANT UPDATE ON public.listings TO authenticated;

COMMIT;

-- ============================================
-- Verify the policies
-- ============================================
-- Run this to see all policies on listings:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'listings';

