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
  return { data, error };
};

export const getActiveLeasesByTenant = async (tenantId) => {
  if (!tenantId) return { data: [], error: { message: "Tenant ID is required." } };
  const { data, error } = await supabase
    .from('leases')
    .select('*, houses(*)')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .limit(1); // Only get the most recent active lease
  return { data, error };
};

export const addLease = async (leaseData) => {
  if (!leaseData.landlord_id || !leaseData.house_id || !leaseData.tenant_id) {
    return { data: null, error: { message: "Landlord, House, and Tenant IDs are required." }};
  }

  // Check if tenant already has an active lease
  const { data: existingLease, error: checkError } = await supabase
    .from('leases')
    .select('id')
    .eq('tenant_id', leaseData.tenant_id)
    .eq('status', 'active')
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    return { data: null, error: checkError };
  }

  if (existingLease) {
    return { 
      data: null, 
      error: { 
        message: "This tenant already has an active lease. Please end their current lease before creating a new one." 
      }
    };
  }

  const { data, error } = await supabase
    .from('leases')
    .insert([leaseData])
    .select();

  return { data, error };
};

export const updateLease = async (leaseId, leaseData) => {
  // If updating to active status, check for existing active leases
  if (leaseData.status === 'active') {
    const { data: existingLease, error: checkError } = await supabase
      .from('leases')
      .select('id')
      .eq('tenant_id', leaseData.tenant_id)
      .eq('status', 'active')
      .neq('id', leaseId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return { data: null, error: checkError };
    }

    if (existingLease) {
      return { 
        data: null, 
        error: { 
          message: "This tenant already has another active lease. Please end their current lease before activating this one." 
        }
      };
    }
  }

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