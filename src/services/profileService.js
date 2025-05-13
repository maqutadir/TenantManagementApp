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
  const { data, error } = await supabase.from('profiles').select('*');
  return { data, error };
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