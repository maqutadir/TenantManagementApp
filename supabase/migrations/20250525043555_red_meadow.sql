/*
  # Update RLS policies for landlord tenant management

  1. Changes
    - Adds policy for landlords to create tenant profiles
    - Ensures landlords can only view and manage tenants they created
    - Maintains existing functionality for users to manage their own profiles

  2. Security
    - Enforces strict tenant creation permissions for landlords
    - Maintains data isolation between different landlords
*/

-- Drop any conflicting policies first
DROP POLICY IF EXISTS "Landlords can only view and manage their tenants" ON profiles;

-- Create comprehensive policy for landlord tenant management
CREATE POLICY "Landlords can manage tenant profiles"
ON profiles
FOR ALL
TO authenticated
USING (
  -- Users can always access their own profile
  auth.uid() = id
  OR
  -- Landlords can access profiles they created
  (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
    AND (
      created_by = auth.uid()
      OR id = auth.uid() -- Landlords can see their own profile
    )
  )
)
WITH CHECK (
  -- Users can modify their own profile
  auth.uid() = id
  OR
  -- Landlords can only modify tenant profiles they created
  (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
    AND (
      id = auth.uid() -- Landlords can modify their own profile
      OR (created_by = auth.uid() AND role = 'tenant') -- Landlords can modify tenants they created
    )
  )
);