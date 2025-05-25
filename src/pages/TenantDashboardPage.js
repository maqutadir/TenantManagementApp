import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, PlusCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MaintenanceRequestModal from '../features/tenant/forms/MaintenanceRequestModal';
import PaymentFormModal from '../features/tenant/forms/PaymentFormModal';
import { formatDate, formatCurrency, calculateDaysRemaining, getLeaseStatusColor } from '../utils/helpers';

// Import Services
import { getActiveLeasesByTenant } from '../services/leaseService';
import { getMaintenanceRequestsByTenant, addMaintenanceRequest } from '../services/maintenanceService';
import { getPaymentsByTenant, createPayment } from '../services/paymentService';

const TenantDashboardPage = ({ currentUser, setIsLoading: setAppIsLoading }) => {
    const [myActiveLeases, setMyActiveLeases] = useState([]);
    const [myMaintenanceRequests, setMyMaintenanceRequests] = useState([]);
    const [myPayments, setMyPayments] = useState([]);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isTenantDataLoading, setIsTenantDataLoading] = useState(true);

    const fetchTenantData = useCallback(async () => {
        if (!currentUser || !currentUser.id) {
            setIsTenantDataLoading(false);
            return;
        }
        setIsTenantDataLoading(true);
        
        const [leasesRes, requestsRes, paymentsRes] = await Promise.all([
            getActiveLeasesByTenant(currentUser.id),
            getMaintenanceRequestsByTenant(currentUser.id),
            getPaymentsByTenant(currentUser.id)
        ]);

        if (leasesRes.error) {
            console.error("Error fetching tenant leases:", leasesRes.error.message);
            alert("Could not load your lease details: " + leasesRes.error.message);
        } else {
            setMyActiveLeases(leasesRes.data || []);
        }

        if (requestsRes.error) {
            console.error("Error fetching tenant maintenance requests:", requestsRes.error.message);
            alert("Could not load your maintenance requests: " + requestsRes.error.message);
        } else {
            setMyMaintenanceRequests(requestsRes.data || []);
        }

        if (paymentsRes.error) {
            console.error("Error fetching tenant payments:", paymentsRes.error.message);
            alert("Could not load your payments: " + paymentsRes.error.message);
        } else {
            setMyPayments(paymentsRes.data || []);
        }
        
        setIsTenantDataLoading(false);
    }, [currentUser]);

    useEffect(() => {
        fetchTenantData();
    }, [fetchTenantData]);
    
    const handleMaintenanceSubmit = async (requestPayloadFromForm) => {
        setIsTenantDataLoading(true);
        const { data, error } = await addMaintenanceRequest(requestPayloadFromForm);
        
        if (error) {
            console.error("Error submitting maintenance request:", error);
            alert("Failed to submit request: " + error.message);
        } else {
            if (data && data.length > 0) {
                setMyMaintenanceRequests(prev => [data[0], ...prev]);
            }
            alert("Maintenance request submitted successfully!");
            setShowRequestModal(false);
        }
        setIsTenantDataLoading(false);
    };

    const handlePaymentSubmit = async (paymentData) => {
        setIsTenantDataLoading(true);
        const { error } = await createPayment(paymentData);
        
        if (error) {
            console.error("Error submitting payment:", error);
            alert("Failed to submit payment: " + error.message);
        } else {
            alert("Payment request submitted successfully! Awaiting landlord approval.");
            await fetchTenantData(); // Refresh all data
            setShowPaymentModal(false);
        }
        setIsTenantDataLoading(false);
    };

    if (isTenantDataLoading) {
        return <div className="min-h-screen flex items-center justify-center"><p>Loading Tenant Dashboard...</p></div>;
    }

    const activeLease = myActiveLeases[0]; // We only allow one active lease
    const daysRemaining = activeLease ? calculateDaysRemaining(activeLease.lease_end_date) : 0;
    const daysColor = getLeaseStatusColor(daysRemaining);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Tenant Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="My Active Lease">
                    {activeLease ? (
                        <div className="space-y-4">
                            <div className="mb-4 pb-4 border-b">
                                <p><strong>Property:</strong> {activeLease.houses ? activeLease.houses.name : 'N/A'} (Unit/Room: {activeLease.room_or_unit_id})</p>
                                <p><strong>Address:</strong> {activeLease.houses ? activeLease.houses.address : 'N/A'}</p>
                                <p><strong>Rent:</strong> {formatCurrency(activeLease.rent_amount)}/month</p>
                                <p><strong>Lease Term:</strong> {formatDate(activeLease.lease_start_date)} to {formatDate(activeLease.lease_end_date)}</p>
                                <p className={`font-medium ${daysColor}`}>
                                    <strong>Days Remaining:</strong> {daysRemaining} days
                                </p>
                            </div>
                        </div>
                    ) : <p className="text-gray-500">No active lease found.</p>}
                </Card>

                <Card title="Payments">
                    {activeLease ? (
                        <div className="space-y-4">
                            <Button 
                                icon={DollarSign} 
                                onClick={() => setShowPaymentModal(true)}
                                className="mb-4"
                            >
                                Submit Cash Payment
                            </Button>
                            {myPayments.length > 0 ? (
                                <div className="space-y-3">
                                    {myPayments.map(payment => (
                                        <div key={payment.id} className="p-3 border rounded-md bg-gray-50">
                                            <p className="font-medium">
                                                {formatCurrency(payment.amount)} - {formatDate(payment.payment_date)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Status: <span className={`font-medium ${
                                                    payment.status === 'approved' ? 'text-green-600' :
                                                    payment.status === 'rejected' ? 'text-red-600' :
                                                    'text-yellow-600'
                                                }`}>{payment.status}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No payment history found.</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500">You need an active lease to make payments.</p>
                    )}
                </Card>

                <Card title="Maintenance Requests" className="md:col-span-2">
                    <Button 
                        icon={PlusCircle} 
                        onClick={() => { 
                            if(activeLease) { 
                                setShowRequestModal(true); 
                            } else { 
                                alert("You need an active lease to submit a request.");
                            }
                        }} 
                        className="mb-4" 
                        disabled={!activeLease}
                    >
                        Submit New Request
                    </Button>
                    {myMaintenanceRequests.length > 0 ? (
                        <ul className="space-y-3">
                            {myMaintenanceRequests.map(req => (
                                <li key={req.id} className="p-3 border rounded-md bg-gray-50 shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-800">{req.description}</p>
                                            <p className="text-sm text-gray-500">
                                                Ticket: {req.ticket_number} | Priority: {req.priority}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Property: {req.leases?.houses?.name} (Unit: {req.leases?.room_or_unit_id})
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            req.status === 'Open' ? 'bg-red-100 text-red-700' : 
                                            req.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 
                                            'bg-green-100 text-green-700'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Submitted: {formatDate(req.submitted_date)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-500">No maintenance requests submitted.</p>}
                </Card>
            </div>

            {showRequestModal && activeLease && (
                <MaintenanceRequestModal
                    isOpen={showRequestModal}
                    onClose={() => setShowRequestModal(false)}
                    onSubmit={handleMaintenanceSubmit}
                    activeLeases={[activeLease]}
                    currentUser={currentUser}
                />
            )}

            {showPaymentModal && activeLease && (
                <PaymentFormModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    onSubmit={handlePaymentSubmit}
                    lease={activeLease}
                />
            )}
        </div>
    );
};

export default TenantDashboardPage;