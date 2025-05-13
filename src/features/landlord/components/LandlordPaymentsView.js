import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../../components/ui/Card';
import { formatDate, formatCurrency } from '../../../utils/helpers';
import { getPaymentsByLeaseIds } from '../../../services/paymentService';
// Assuming you have this service
const LandlordPaymentsView = ({ leases, tenants, houses, setIsLoading }) => {
    const [payments, setPayments] = useState([]);

    const fetchPaymentsForLandlord = useCallback(async () => {
        if (!Array.isArray(leases) || leases.length === 0) {
            setPayments([]);
            return;
        }
        setIsLoading(true);
        const leaseIds = leases.map(l => l.id);
        const { data, error } = await getPaymentsByLeaseIds(leaseIds);
        if (error) {
            console.error("Error fetching payments:", error);
            setPayments([]);
        } else {
            const paymentsWithDetails = (data || []).map(payment => {
                const lease = leases.find(l => l.id === payment.lease_id);
                const tenant = Array.isArray(tenants) ? tenants.find(t => t.id === lease?.tenant_id) : null;
                const house = Array.isArray(houses) ? houses.find(h => h.id === lease?.house_id) : null;
                return {
                    ...payment,
                    tenantName: tenant ? tenant.name : 'N/A',
                    houseName: house ? house.name : 'N/A',
                    roomNumber: lease?.room_or_unit_id || 'N/A',
                };
            });
            setPayments(paymentsWithDetails);
        }
        setIsLoading(false);
    }, [leases, tenants, houses, setIsLoading]);

    useEffect(() => {
        fetchPaymentsForLandlord();
    }, [fetchPaymentsForLandlord]);

    return (
        <Card title="Rent Payments Overview">
            {payments.length === 0 ? <p className="text-gray-500">No payment records found for your leases.</p> : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">House (Unit)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {payments.map(payment => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(payment.payment_date)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{payment.tenantName}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{payment.houseName} ({payment.roomNumber})</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatCurrency(payment.amount)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{payment.method}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payment.status === 'Paid' ?
                                    'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{payment.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
             <p className="mt-4 text-sm text-gray-500">Note: Payment logging is conceptual.
            Landlords can view payments if tenants record them.</p>
        </Card>
    );
};

export default LandlordPaymentsView;