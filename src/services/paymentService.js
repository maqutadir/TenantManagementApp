import { supabase } from '../supabaseClient';

export const getPaymentsByLeaseIds = async (leaseIds) => {
  if (!leaseIds || leaseIds.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      lease:leases (
        id,
        room_or_unit_id,
        houses:houses (name),
        tenant:profiles!leases_tenant_id_fkey (name)
      )
    `)
    .in('lease_id', leaseIds)
    .order('payment_date', { ascending: false });

  return { data, error };
};

export const getPaymentsByTenant = async (tenantId) => {
  if (!tenantId) return { data: [], error: { message: "Tenant ID is required." } };
  
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      lease:leases (
        id,
        room_or_unit_id,
        houses:houses (name)
      )
    `)
    .eq('lease:leases.tenant_id', tenantId)
    .order('payment_date', { ascending: false });

  return { data, error };
};

export const createPayment = async (paymentData) => {
  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .select();
  return { data, error };
};

export const updatePaymentStatus = async (paymentId, status) => {
  const { data, error } = await supabase
    .from('payments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select();
  return { data, error };
};