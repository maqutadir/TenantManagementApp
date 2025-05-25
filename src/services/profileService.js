import { supabase } from '../supabaseClient';

export const getProfileById = async (userId) => {
  if (!userId) return { data: null, error: { message: "User ID is required." } };
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const getAllProfiles = async () => {
  // This will only return profiles the user has access to based on RLS policies
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createTenantProfile = async (tenantData, landlordId) => {
  if (!landlordId) return { data: null, error: { message: "Landlord ID is required." } };
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: tenantData.email,
    password: tenantData.password,
    email_confirm: true,
    user_metadata: {
      name: tenantData.name,
      role: 'tenant'
    }
  });

  if (error) return { data: null, error };

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: data.user.id,
      email: tenantData.email,
      name: tenantData.name,
      phone: tenantData.phone,
      role: 'tenant',
      created_by: landlordId
    }])
    .select();

  if (profileError) return { data: null, error: profileError };
  return { data: profile[0], error: null };
};

export const updateProfile = async (userId, profileData) => {
  if (!userId) return { data: null, error: { message: "User ID is required for update." } };
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select();
  return { data, error };
};

export const deleteProfile = async (userId) => {
  if (!userId) return { data: null, error: { message: "User ID is required for deletion." } };
  const { data, error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  return { data, error };
};