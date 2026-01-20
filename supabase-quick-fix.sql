-- ============================================
-- QUICK FIX: Remove Recursion from Listings Policies
-- ============================================
-- Run this FIRST to get unblocked, then run the full fix
-- ============================================

-- Step 1: Drop ALL existing policies on listings (this removes the problematic ones)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'listings' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.listings', r.policyname);
    END LOOP;
END $$;

-- Step 2: Create simple INSERT policy (no profile checks = no recursion)
CREATE POLICY "Allow authenticated users to insert listings"
ON "public"."listings"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 3: Create simple SELECT policy (users see their own + all if needed)
-- For now, let's allow users to see all listings (you can restrict later)
CREATE POLICY "Allow authenticated users to view listings"
ON "public"."listings"
FOR SELECT
TO authenticated
USING (true);

-- ============================================
-- This should fix the recursion immediately
-- After this works, you can run the full fix
-- with the is_admin() function for proper security
-- ============================================

