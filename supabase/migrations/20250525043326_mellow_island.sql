/*
  # Update landlord tenant view policies

  1. Changes
    - Modify RLS policies to ensure landlords can only view tenants they created
    - Remove ability for landlords to view all tenant profiles
    - Keep ability for users to view their own profiles
    - Maintain landlord's ability to manage their created tenants

  2. Security
    - Stricter access control for tenant data
    - Ensures data isolation between different landlords
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Landlords can manage their created tenants" ON profiles;

-- Create new RLS policy
CREATE POLICY "Landlords can only view and manage their tenants"
ON profiles
FOR ALL
TO authenticated
USING (
  -- Users can always access their own profile
  auth.uid() = id
  OR
  -- Landlords can only access tenant profiles they created
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
    AND created_by = auth.uid()
    AND role = 'tenant'
  )
);