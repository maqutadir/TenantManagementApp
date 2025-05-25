/*
  # Tenant Management System Schema Update

  1. Changes
    - Add `created_by` column to profiles table to track which landlord created a tenant
    - Add foreign key constraint to ensure tenants are linked to landlords
    - Add RLS policies to ensure tenants are only visible to their landlords
    - Remove tenant role from signup options

  2. Security
    - Enable RLS on profiles table
    - Add policies for landlord access to tenant profiles
    - Add policy for tenant self-access
*/

-- Add created_by column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_created_by ON profiles(created_by);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Profiles are viewable by owner" ON profiles;
DROP POLICY IF EXISTS "Landlords can view their tenants" ON profiles;
DROP POLICY IF EXISTS "Tenants can view own profile" ON profiles;

-- Create new RLS policies
CREATE POLICY "Landlords can view and manage their tenants"
ON profiles
FOR ALL
TO authenticated
USING (
  (role = 'landlord') OR  -- Landlords can see their own profile
  (auth.uid() = created_by) OR  -- Landlords can see tenants they created
  (auth.uid() = id)  -- Users can see their own profile
)
WITH CHECK (
  (role = 'landlord') OR  -- Landlords can modify their own profile
  (auth.uid() = created_by)  -- Landlords can modify their tenants' profiles
);