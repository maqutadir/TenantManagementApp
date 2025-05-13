import { supabase } from '../supabaseClient';

export const signInUser = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data?.user, session: data?.session, error };
};

export const signUpUser = async (email, password, metadata) => {
   const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  console.log("Error is", error)
  return { user: data?.user, session: data?.session, error }; // data contains user and session
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
};

export const getCurrentSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    return { session: data?.session, error };
};

export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
};