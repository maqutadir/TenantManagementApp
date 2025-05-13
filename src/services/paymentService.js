import { supabase } from '../supabaseClient';

export const getPaymentsByLeaseIds = async (leaseIds) => {
  if (!leaseIds || leaseIds.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .in('lease_id', leaseIds)
    .order('payment_date', { ascending: false });

  return { data, error };
};

export const addPayment = async (paymentData) => {
    if (!paymentData.lease_id || !paymentData.amount || !paymentData.payment_date) {
        return { data: null, error: { message: "Lease ID, Amount, and Payment Date are required." }};
    }
    const { data, error } = await supabase
        .from('payments')
        .insert([paymentData])
        .select();
    return { data, error };
};