-- ============================================
-- Fix Applications RLS Policies
-- ============================================
-- This script ensures all RLS policies use is_admin() function
-- to avoid recursion issues
-- ============================================

BEGIN;

-- Step 1: Ensure is_admin() function exists and is correct
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

-- Step 2: Drop ALL existing policies on applications table
DROP POLICY IF EXISTS "admin full access to application" ON public.applications;
DROP POLICY IF EXISTS "is_admin() admin to read applications" ON public.applications;
DROP POLICY IF EXISTS "is_admin() with check is_admin() for admin to update applications" ON public.applications;
DROP POLICY IF EXISTS "Allow public to insert applications" ON public.applications;
DROP POLICY IF EXISTS "Allow admins to read all applications" ON public.applications;
DROP POLICY IF EXISTS "Allow admins to update applications" ON public.applications;

-- Step 3: Create clean RLS policies using only is_admin() function

-- Policy 1: Allow public to insert applications (for applicants)
CREATE POLICY "Allow public to insert applications"
ON public.applications
FOR INSERT
TO public
WITH CHECK (true);

-- Policy 2: Allow admins to read all applications
CREATE POLICY "Allow admins to read all applications"
ON public.applications
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Policy 3: Allow admins to update applications
CREATE POLICY "Allow admins to update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Step 4: Grant necessary permissions
GRANT INSERT ON public.applications TO public;
GRANT SELECT ON public.applications TO authenticated;
GRANT UPDATE ON public.applications TO authenticated;

COMMIT;

-- ============================================
-- Verify the policies
-- ============================================
-- Run this to see all policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'applications';

