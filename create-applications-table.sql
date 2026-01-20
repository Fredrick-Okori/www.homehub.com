-- ============================================
-- Create Applications Table
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  
  -- Personal Information
  surname text NOT NULL,
  given_name text NOT NULL,
  current_address text NOT NULL,
  
  -- Contact Information
  work_address text,
  work_phone text,
  email text NOT NULL,
  mobile_number text NOT NULL,
  mobile_registered_name text NOT NULL,
  
  -- Identification
  nin_number text,
  card_number text,
  passport_number text,
  
  -- File URLs (stored in S3)
  national_id_front_url text,
  national_id_back_url text,
  passport_photo_url text,
  passport_particulars_url text,
  applicant_photo_url text,
  employment_contract_url text, -- Optional
  
  -- Employment Information
  employer_name text,
  
  -- Next of Kin
  next_of_kin_name text NOT NULL,
  next_of_kin_number text NOT NULL,
  
  -- Status and Metadata
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid, -- Admin who updated the application (null for pending)
  
  -- Foreign Keys
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_listing_id_fkey FOREIGN KEY (listing_id) 
    REFERENCES public.listings(id) ON DELETE CASCADE,
  CONSTRAINT applications_updated_by_fkey FOREIGN KEY (updated_by) 
    REFERENCES public.profiles(id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Create indexes
CREATE INDEX IF NOT EXISTS applications_listing_idx 
  ON public.applications USING btree (listing_id);
CREATE INDEX IF NOT EXISTS applications_status_idx 
  ON public.applications USING btree (status);
CREATE INDEX IF NOT EXISTS applications_created_at_idx 
  ON public.applications USING btree (created_at);
CREATE INDEX IF NOT EXISTS applications_updated_by_idx 
  ON public.applications USING btree (updated_by);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Allow public to insert applications
CREATE POLICY "Allow public to insert applications"
ON public.applications
FOR INSERT
TO public
WITH CHECK (true);

-- Allow public to read their own applications (if we add user_id later)
-- For now, allow admins to read all
CREATE POLICY "Allow admins to read all applications"
ON public.applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow admins to update applications
CREATE POLICY "Allow admins to update applications"
ON public.applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Grant permissions
GRANT INSERT ON public.applications TO public;
GRANT SELECT ON public.applications TO authenticated;
GRANT UPDATE ON public.applications TO authenticated;

-- ============================================
-- Notes:
-- ============================================
-- 1. All file URLs will be stored after uploading to S3
-- 2. employment_contract_url is optional
-- 3. Status can be: 'pending', 'approved', 'rejected'
-- 4. RLS allows public to insert, but only admins can read/update
-- 5. updated_by will be NULL for pending applications
-- 6. When an admin updates status to 'approved' or 'rejected',
--    updated_by should be set to the admin's profile ID
-- ============================================

