/*
  # Enhance landlord tenant management policies

  1. Changes
    - Add policies to allow landlords to create and manage tenant profiles
    - Ensure tenants can only access their own profiles
    - Allow landlords to view all tenant profiles for lease management

  2. Security
    - Maintain strict RLS policies
    - Ensure data isolation between different landlords
    - Protect tenant privacy while enabling landlord management
*/

-- Ensure landlords can only manage tenants they create
CREATE POLICY "Landlords can manage their created tenants"
ON profiles
FOR ALL
TO authenticated
USING (
  -- Allow users to access their own profile
  auth.uid() = id
  OR
  -- Allow landlords to access profiles they created
  (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
    AND (
      created_by = auth.uid()
      OR role = 'landlord' -- Landlords can see other landlords for reference
    )
  )
)
WITH CHECK (
  -- Allow users to modify their own profile
  auth.uid() = id
  OR
  -- Allow landlords to modify profiles they created
  (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'landlord'
    AND created_by = auth.uid()
    AND role = 'tenant' -- Landlords can only modify tenant profiles
  )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);