import { supabase } from '../supabaseClient';

export const getLeasesByLandlord = async (landlordId) => {
  if (!landlordId) return { data: [], error: { message: "Landlord ID is required." } };
  const { data, error } = await supabase
    .from('leases')
    .select(`
      *,
      houses(*),
      tenant:profiles!leases_tenant_id_fkey (id, name, email)
    `)
    .eq('landlord_id', landlordId);

    console.log('Active leases are', data, error)
  return { data, error };
};

export const getActiveLeasesByTenant = async (tenantId) => {
  if (!tenantId) return { data: [], error: { message: "Tenant ID is required." } };
  const { data, error } = await supabase
    .from('leases')
    .select('*, houses(*)')
    .eq('tenant_id', tenantId)
    .eq('status', 'active');
  return { data, error };
};

export const addLease = async (leaseData) => {
  if (!leaseData.landlord_id || !leaseData.house_id || !leaseData.tenant_id) {
      return { data: null, error: { message: "Landlord, House, and Tenant IDs are required." }};
  }
  const { data, error } = await supabase
    .from('leases')
    .insert([leaseData])
    .select();
  return { data, error };
};

export const updateLease = async (leaseId, leaseData) => {
    console.log('lease data is', leaseData)
  const { data, error } = await supabase
    .from('leases')
    .update(leaseData)
    .eq('id', leaseId)
    .select();
  return { data, error };
};

export const deleteLease = async (leaseId, filters = null) => {
  let query = supabase.from('leases').delete();
  if (leaseId) {
    query = query.eq('id', leaseId);
  } else if (filters) {
    for (const key in filters) {
      query = query.eq(key, filters[key]);
    }
  } else {
    return { data: null, error: { message: "Lease ID or filters required for deletion."}};
  }
  const { data, error } = await query;
  return { data, error };
};