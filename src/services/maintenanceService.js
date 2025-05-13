import { supabase } from '../supabaseClient';

export const getMaintenanceRequestsForLandlordHouses = async (houseIds) => {
  if (!houseIds || houseIds.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      leases ( room_or_unit_id, houses (name, address) ),
      tenant:profiles!maintenance_requests_tenant_id_fkey (id, name, email)
    `)
    .in('house_id', houseIds)
    .order('submitted_date', { ascending: false });

  return { data, error };
};

export const getMaintenanceRequestsByTenant = async (tenantId) => {
  if (!tenantId) return { data: [], error: { message: "Tenant ID is required." } };
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select(`
        *, 
         leases ( room_or_unit_id, houses (name) )
    `)
    .eq('tenant_id', tenantId)
    .order('submitted_date', { ascending: false });
  return { data, error };
};

export const addMaintenanceRequest = async (requestData) => {
  if (!requestData.lease_id || !requestData.house_id || !requestData.tenant_id || !requestData.description) {
      return { data: null, error: { message: "Lease, House, Tenant IDs, and Description are required."}};
  }
  const { data, error } = await supabase
    .from('maintenance_requests')
    .insert([requestData])
    .select();
  return { data, error };
};

export const updateMaintenanceRequestStatus = async (requestId, status, resolutionNotes = null) => {
  const updatePayload = { 
     status,
    resolved_at: status === 'Resolved' || status === 'Closed' ? new Date().toISOString() : null
  };

  if (resolutionNotes !== null) {
    updatePayload.resolution_notes = resolutionNotes;
  }

  const { data, error } = await supabase
    .from('maintenance_requests')
    .update(updatePayload)
    .eq('id', requestId)
    .select();
  return { data, error };
};