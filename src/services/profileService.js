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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createTenantProfile = async (tenantData, landlordId) => {
  if (!landlordId) return { data: null, error: { message: "Landlord ID is required." } };
  
  // First, create the auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: tenantData.email,
    password: tenantData.password,
    email_confirm: true,
    user_metadata: {
      name: tenantData.name,
      role: 'tenant'
    }
  });

  if (authError) {
    console.error("Auth error:", authError);
    return { data: null, error: authError };
  }

  // Then create the profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert([{
      id: authData.user.id,
      email: tenantData.email,
      name: tenantData.name,
      phone: tenantData.phone,
      role: 'tenant',
      created_by: landlordId
    }])
    .select();

  if (profileError) {
    console.error("Profile error:", profileError);
    // Try to clean up the auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    return { data: null, error: profileError };
  }

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
  
  // First delete the profile
  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    return { data: null, error: profileError };
  }

  // Then delete the auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("Failed to delete auth user:", authError);
    return { data: null, error: authError };
  }

  return { data: null, error: null };
};