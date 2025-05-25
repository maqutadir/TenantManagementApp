import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { formatDate, formatCurrency } from '../../../utils/helpers';
import { getPaymentsByLeaseIds, updatePaymentStatus } from '../../../services/paymentService';

const LandlordPaymentsView = ({ leases, setIsLoading }) => {
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
            setPayments(data || []);
        }
        setIsLoading(false);
    }, [leases, setIsLoading]);

    useEffect(() => {
        fetchPaymentsForLandlord();
    }, [fetchPaymentsForLandlord]);

    const handlePaymentAction = async (paymentId, status) => {
        setIsLoading(true);
        const { error } = await updatePaymentStatus(paymentId, status);
        if (error) {
            console.error("Error updating payment:", error);
            alert(`Failed to ${status} payment: ${error.message}`);
        } else {
            await fetchPaymentsForLandlord();
            alert(`Payment ${status} successfully`);
        }
        setIsLoading(false);
    };

    return (
        <Card title="Payment Requests">
            {payments.length === 0 ? (
                <p className="text-gray-500">No payment records found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property (Unit)</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payments.map(payment => (
                                <tr key={payment.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(payment.payment_date)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                        {payment.lease?.tenant?.name || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {payment.lease?.houses?.name || 'N/A'} ({payment.lease?.room_or_unit_id || 'N/A'})
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(payment.amount)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {payment.method}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            payment.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        } capitalize`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                                        {payment.status === 'pending' && (
                                            <>
                                                <Button
                                                    onClick={() => handlePaymentAction(payment.id, 'approved')}
                                                    variant="success"
                                                    size="sm"
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    onClick={() => handlePaymentAction(payment.id, 'rejected')}
                                                    variant="danger"
                                                    size="sm"
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
};

export default LandlordPaymentsView;