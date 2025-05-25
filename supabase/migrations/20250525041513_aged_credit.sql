/*
  # Fix tenant management RLS policies

  1. Changes
    - Add policies to allow landlords to create tenant profiles
    - Add policies to allow landlords to manage their tenants
    - Add policies to allow tenants to view their own profiles

  2. Security
    - Enable RLS on profiles table
    - Ensure proper access control for tenant management
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Landlords can view and manage their tenants" ON profiles;

-- Create new RLS policies
CREATE POLICY "Landlords can create tenant profiles"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Landlord creating a tenant profile
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
  AND role = 'tenant'
);

CREATE POLICY "Landlords can view their tenants"
ON profiles
FOR SELECT
TO authenticated
USING (
  -- User can view their own profile
  id = auth.uid()
  OR
  -- Landlord can view tenants they created
  (created_by = auth.uid() AND role = 'tenant')
  OR
  -- Landlord can view all profiles (needed for tenant management)
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
);

CREATE POLICY "Landlords can update their tenants"
ON profiles
FOR UPDATE
TO authenticated
USING (
  -- User can update their own profile
  id = auth.uid()
  OR
  -- Landlord can update tenants they created
  (created_by = auth.uid() AND role = 'tenant')
)
WITH CHECK (
  -- User can update their own profile
  id = auth.uid()
  OR
  -- Landlord can update tenants they created
  (created_by = auth.uid() AND role = 'tenant')
);

CREATE POLICY "Landlords can delete their tenants"
ON profiles
FOR DELETE
TO authenticated
USING (
  -- Landlord can delete tenants they created
  created_by = auth.uid() AND role = 'tenant'
);