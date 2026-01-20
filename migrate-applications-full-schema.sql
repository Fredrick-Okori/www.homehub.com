-- ============================================
-- Migration: Transform applications table to new schema
-- ============================================
-- Run this in your Supabase SQL Editor
-- This will convert your existing table from the old schema
-- (with form_data jsonb, user_id, id_documents, supporting_documents)
-- to the new schema with explicit columns
-- ============================================

BEGIN;

-- Step 1: Drop old constraints that depend on user_id
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS unique_application,
  DROP CONSTRAINT IF EXISTS applications_user_id_fkey;

-- Step 2: Drop old columns that we're replacing
ALTER TABLE public.applications
  DROP COLUMN IF EXISTS user_id,
  DROP COLUMN IF EXISTS form_data,
  DROP COLUMN IF EXISTS id_documents,
  DROP COLUMN IF EXISTS supporting_documents;

-- Step 3: Drop old index on user_id
DROP INDEX IF EXISTS applications_user_idx;

-- Step 4: Add new explicit columns for personal information
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS surname              text,
  ADD COLUMN IF NOT EXISTS given_name           text,
  ADD COLUMN IF NOT EXISTS current_address      text;

-- Step 5: Add contact information columns
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS work_address         text,
  ADD COLUMN IF NOT EXISTS work_phone           text,
  ADD COLUMN IF NOT EXISTS email                text,
  ADD COLUMN IF NOT EXISTS mobile_number        text,
  ADD COLUMN IF NOT EXISTS mobile_registered_name text;

-- Step 6: Add identification columns
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS nin_number           text,
  ADD COLUMN IF NOT EXISTS card_number          text,
  ADD COLUMN IF NOT EXISTS passport_number      text;

-- Step 7: Add file URL columns (replacing id_documents and supporting_documents)
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS national_id_front_url      text,
  ADD COLUMN IF NOT EXISTS national_id_back_url       text,
  ADD COLUMN IF NOT EXISTS passport_photo_url         text,
  ADD COLUMN IF NOT EXISTS passport_particulars_url   text,
  ADD COLUMN IF NOT EXISTS applicant_photo_url        text,
  ADD COLUMN IF NOT EXISTS employment_contract_url     text;

-- Step 8: Add employment information
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS employer_name       text;

-- Step 9: Add next of kin columns
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS next_of_kin_name    text,
  ADD COLUMN IF NOT EXISTS next_of_kin_number  text;

-- Step 10: Add updated_by column (for tracking admin who updates status)
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS updated_by          uuid;

-- Step 11: Add updated_at if it doesn't exist
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS updated_at          timestamp with time zone DEFAULT now();

-- Step 12: Set NOT NULL constraints on required fields
-- (We do this after adding columns to avoid errors on existing rows)
-- First, update any NULL values with defaults if needed
UPDATE public.applications
SET 
  surname = COALESCE(surname, ''),
  given_name = COALESCE(given_name, ''),
  current_address = COALESCE(current_address, ''),
  email = COALESCE(email, ''),
  mobile_number = COALESCE(mobile_number, ''),
  mobile_registered_name = COALESCE(mobile_registered_name, ''),
  next_of_kin_name = COALESCE(next_of_kin_name, ''),
  next_of_kin_number = COALESCE(next_of_kin_number, '')
WHERE 
  surname IS NULL 
  OR given_name IS NULL 
  OR current_address IS NULL 
  OR email IS NULL 
  OR mobile_number IS NULL 
  OR mobile_registered_name IS NULL 
  OR next_of_kin_name IS NULL 
  OR next_of_kin_number IS NULL;

-- Now set NOT NULL constraints
ALTER TABLE public.applications
  ALTER COLUMN surname SET NOT NULL;

ALTER TABLE public.applications
  ALTER COLUMN given_name SET NOT NULL;

ALTER TABLE public.applications
  ALTER COLUMN current_address SET NOT NULL;

ALTER TABLE public.applications
  ALTER COLUMN email SET NOT NULL;

ALTER TABLE public.applications
  ALTER COLUMN mobile_number SET NOT NULL;

ALTER TABLE public.applications
  ALTER COLUMN mobile_registered_name SET NOT NULL;

ALTER TABLE public.applications
  ALTER COLUMN next_of_kin_name SET NOT NULL;

ALTER TABLE public.applications
  ALTER COLUMN next_of_kin_number SET NOT NULL;

-- Step 13: Add foreign key constraint for updated_by
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_updated_by_fkey;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_updated_by_fkey 
  FOREIGN KEY (updated_by) 
  REFERENCES public.profiles(id) 
  ON DELETE SET NULL;

-- Step 14: Create indexes
CREATE INDEX IF NOT EXISTS applications_listing_idx 
  ON public.applications USING btree (listing_id);
CREATE INDEX IF NOT EXISTS applications_status_idx 
  ON public.applications USING btree (status);
CREATE INDEX IF NOT EXISTS applications_created_at_idx 
  ON public.applications USING btree (created_at);
CREATE INDEX IF NOT EXISTS applications_updated_by_idx 
  ON public.applications USING btree (updated_by);

-- Step 15: Create SECURITY DEFINER function to check if user is admin
-- This prevents RLS recursion issues
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

-- Step 16: Ensure RLS policies are correct (using is_admin() function to prevent recursion)
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public to insert applications" ON public.applications;
DROP POLICY IF EXISTS "Allow admins to read all applications" ON public.applications;
DROP POLICY IF EXISTS "Allow admins to update applications" ON public.applications;

-- Recreate RLS policies using the is_admin() function
CREATE POLICY "Allow public to insert applications"
ON public.applications
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow admins to read all applications"
ON public.applications
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Allow admins to update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Step 16: Grant permissions
GRANT INSERT ON public.applications TO public;
GRANT SELECT ON public.applications TO authenticated;
GRANT UPDATE ON public.applications TO authenticated;

COMMIT;

-- ============================================
-- Notes:
-- ============================================
-- 1. This migration removes user_id since applicants don't need to be signed in
-- 2. All form fields are now explicit columns instead of JSONB
-- 3. File URLs are stored in separate columns instead of arrays
-- 4. updated_by tracks which admin updated the application status
-- 5. Existing data: If you have existing applications in form_data JSONB,
--    you'll need to manually migrate that data or it will be lost
-- ============================================

