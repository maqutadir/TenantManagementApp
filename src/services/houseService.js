import { supabase } from '../supabaseClient';

export const getHousesByLandlord = async (landlordId) => {
  if (!landlordId) return { data: [], error: { message: "Landlord ID is required." } };
  const { data, error } = await supabase
    .from('houses')
    .select('*')
    .eq('landlord_id', landlordId);
  return { data, error };
};

export const addHouse = async (houseData) => {
  if (!houseData.landlord_id) return { data: null, error: { message: "Landlord ID is required to add a house." } };
  const { data, error } = await supabase
    .from('houses')
    .insert([houseData])
    .select();
  return { data, error };
};

export const updateHouse = async (houseId, houseData) => {
  const { data, error } = await supabase
    .from('houses')
    .update(houseData)
    .eq('id', houseId)
    .select();
  return { data, error };
};

export const deleteHouse = async (houseId) => {
  const { error: leaseError } = await supabase.from('leases').delete().eq('house_id', houseId);
  if (leaseError) {
      console.warn(`Could not delete leases for house ${houseId}, house deletion will proceed:`, leaseError.message);
  }
  const { data, error: houseError } = await supabase
    .from('houses')
    .delete()
    .eq('id', houseId);
  if(houseError) return { data: null, error: houseError };
  return { data, error: null };
};