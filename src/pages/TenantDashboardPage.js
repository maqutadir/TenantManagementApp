// src/pages/TenantDashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, PlusCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import MaintenanceRequestModal from '../features/tenant/forms/MaintenanceRequestModal';
import { formatDate, formatCurrency } from '../utils/helpers';

// Import Services
import { getActiveLeasesByTenant } from '../services/leaseService';
import { getMaintenanceRequestsByTenant, addMaintenanceRequest } from '../services/maintenanceService';

const TenantDashboardPage = ({ currentUser, setIsLoading: setAppIsLoading }) => {
    const [myActiveLeases, setMyActiveLeases] = useState([]);
    const [myMaintenanceRequests, setMyMaintenanceRequests] = useState([]);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [isTenantDataLoading, setIsTenantDataLoading] = useState(true); // Local loading state for this page's data

    const fetchTenantData = useCallback(async () => {
        if (!currentUser || !currentUser.id) {
            setIsTenantDataLoading(false);
            return;
        }
        setIsTenantDataLoading(true); // Start loading tenant-specific data
        
        const [leasesRes, requestsRes] = await Promise.all([
            getActiveLeasesByTenant(currentUser.id),
            getMaintenanceRequestsByTenant(currentUser.id)
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
        
        setIsTenantDataLoading(false); // Finish loading tenant-specific data
    }, [currentUser]); // Removed setIsLoading (app-level) from dependencies

    useEffect(() => {
        fetchTenantData();
    }, [fetchTenantData]);
    
    const handleMaintenanceSubmit = async (requestPayloadFromForm) => {
        setIsTenantDataLoading(true); // Indicate loading for this action
        const { data, error } = await addMaintenanceRequest(requestPayloadFromForm);
        
        if (error) {
            console.error("Error submitting maintenance request:", error);
            alert("Failed to submit request: " + error.message);
        } else {
            if (data && data.length > 0) {
                // Add new request to the top of the list for immediate UI update
                setMyMaintenanceRequests(prev => [data[0], ...prev]);
            }
            alert("Maintenance request submitted successfully!");
            setShowRequestModal(false);
        }
        setIsTenantDataLoading(false); // Finish loading for this action
    };

    if (isTenantDataLoading) {
        return <div className="min-h-screen flex items-center justify-center"><p>Loading Tenant Dashboard...</p></div>;
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Tenant Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="My Active Lease(s)">
                    {myActiveLeases.length > 0 ? myActiveLeases.map(lease => {
                        const house = lease.houses; // House data is nested from service call
                        const unitIdentifier = lease.room_or_unit_id || "N/A";
                        return (
                            <div key={lease.id} className="mb-4 pb-4 border-b last:border-b-0">
                                <p><strong>Property:</strong> {house ? house.name : 'N/A'} (Unit/Room: {unitIdentifier})</p>
                                <p><strong>Address:</strong> {house ? house.address : 'N/A'}</p>
                                <p><strong>Rent:</strong> {formatCurrency(lease.rent_amount)}/month</p>
                                <p><strong>Lease Term:</strong> {formatDate(lease.lease_start_date)} to {formatDate(lease.lease_end_date)}</p>
                            </div>
                        );
                    }) : <p className="text-gray-500">No active leases found.</p>}
                </Card>

                <Card title="Payments">
                    <p className="text-gray-600 mb-3">View your payment history and make new payments.</p>
                    {myActiveLeases.length > 0 && <Button icon={DollarSign} onClick={() => alert('Payment feature to be implemented using paymentService.')}>Make a Payment</Button>}
                    <p className="mt-2 text-xs text-gray-400">Payment functionality is conceptual.</p>
                </Card>

                <Card title="Maintenance Requests" className="md:col-span-2">
                    <Button 
                        icon={PlusCircle} 
                        onClick={() => { 
                            if(myActiveLeases.length > 0) { 
                                setShowRequestModal(true); 
                            } else { 
                                alert("You need an active lease to submit a request.");
                            }
                        }} 
                        className="mb-4" 
                        disabled={myActiveLeases.length === 0}
                    >
                        Submit New Request
                    </Button>
                    {myMaintenanceRequests.length > 0 ? (
                        <ul className="space-y-3">
                            {myMaintenanceRequests.map(req => (
                                <li key={req.id} className="p-3 border rounded-md bg-gray-50 shadow-sm">
                                    <p className="font-medium text-gray-800">{req.description}</p>
                                    <p className="text-sm text-gray-500">
                                        Submitted: {formatDate(req.submitted_date)} | Priority: {req.priority} | Status: 
                                        <span className={`ml-1 font-semibold ${
                                            req.status === 'Open' ? 'text-red-600' : 
                                            req.status === 'In Progress' ? 'text-yellow-600' : 
                                            'text-green-600'
                                        }`}>{req.status}</span>
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-gray-500">No maintenance requests submitted.</p>}
                </Card>
            </div>

            {showRequestModal && myActiveLeases.length > 0 && (
                <MaintenanceRequestModal
                    isOpen={showRequestModal}
                    onClose={() => setShowRequestModal(false)}
                    onSubmit={handleMaintenanceSubmit}
                    activeLeases={myActiveLeases}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
};

export default TenantDashboardPage;
