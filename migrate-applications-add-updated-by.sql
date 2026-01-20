-- ============================================
-- Migration: Add updated_by field to applications table
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

BEGIN;

-- Add updated_by column (nullable, will be null for pending applications)
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS updated_by uuid;

-- Add foreign key constraint for updated_by (references profiles.id)
-- ON DELETE SET NULL means if the admin profile is deleted, set updated_by to null
ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_updated_by_fkey;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_updated_by_fkey 
  FOREIGN KEY (updated_by) 
  REFERENCES public.profiles(id) 
  ON DELETE SET NULL;

-- Create index for updated_by
CREATE INDEX IF NOT EXISTS applications_updated_by_idx
  ON public.applications USING btree (updated_by);

COMMIT;

-- ============================================
-- Notes:
-- ============================================
-- 1. updated_by will be NULL for pending applications
-- 2. When an admin updates status to 'approved' or 'rejected', 
--    updated_by should be set to the admin's profile ID (auth.uid())
-- 3. updated_at should also be updated when status changes
-- ============================================

