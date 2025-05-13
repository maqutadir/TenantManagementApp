import React, { useState, useEffect, useCallback } from 'react';
import Card from '../../../components/ui/Card';
import Select from '../../../components/ui/Select'; // Reusable Select component
import { formatDate } from '../../../utils/helpers';
import { getMaintenanceRequestsForLandlordHouses, updateMaintenanceRequestStatus } from '../../../services/maintenanceService';

const LandlordMaintenanceView = ({ leases, tenants, houses, setIsLoading }) => {
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);

    const fetchLandlordMaintenanceRequests = useCallback(async () => {
        if (!Array.isArray(leases) || leases.length === 0) {
            setMaintenanceRequests([]);
            return;
        }
        setIsLoading(true);
        const houseIds = [...new Set(leases.map(l => l.house_id))]; // Unique house IDs from landlord's leases
            const { data, error } = await getMaintenanceRequestsForLandlordHouses(houseIds);
        if (error) {
            console.error("Error fetching maintenance requests:", error);
            setMaintenanceRequests([]);
        } else {
            // The service already joins and provides tenant/house names if structured correctly
            // If not, you might need to map and enrich here as done in previous versions
            setMaintenanceRequests(data || []);
        }
        setIsLoading(false);
    }, [leases, setIsLoading]);
    // Removed tenants and houses as service should handle joins

    useEffect(() => {
        fetchLandlordMaintenanceRequests();
    }, [fetchLandlordMaintenanceRequests]);

    const handleUpdateRequestStatus = async (requestId, newStatus) => {
        setIsLoading(true);
        const { data, error } = await updateMaintenanceRequestStatus(requestId, newStatus);
        if (error) {
            console.error('Error updating maintenance status:', error);
            alert('Failed to update status: ' + error.message);
        } else {
            // Refetch or update local state
            setMaintenanceRequests(prevRequests =>
                 prevRequests.map(req =>
                     req.id === requestId ? { ...req, ...data[0] } : req // Assuming data[0] is the updated record
               )
            );
            alert(`Request status updated to ${newStatus}.`);
        }
        setIsLoading(false);
    };

    return (
        <Card title="Maintenance Requests">
            {maintenanceRequests.length === 0 ? <p className="text-gray-500">No maintenance requests found for your properties.</p> : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property (Unit)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {maintenanceRequests.map(req => {
                         const tenantName = req.tenant?.name || 'N/A';
                         // Access joined data
                         const houseName = req.leases?.houses?.name || 'N/A';
                         const roomOrUnit = req.leases?.room_or_unit_id || 'N/A';
                            return (
                            <tr key={req.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(req.submitted_date)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{tenantName}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{houseName} ({roomOrUnit})</td>
                                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate" title={req.description}>{req.description}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{req.priority}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        req.status === 'Open' ? 'bg-red-100 text-red-700' :
                                        req.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                      } capitalize`}>{req.status}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1">
                                    <Select
                                        value={req.status}
                                        onChange={(e) => handleUpdateRequestStatus(req.id, e.target.value)}
                                        options={[
                                            {value: 'Open', label: 'Open'},
                                            {value: 'In Progress', label: 'In Progress'},
                                            {value: 'Resolved', label: 'Resolved'},
                                            {value: 'Closed', label: 'Closed'}
                                        ]}
                                        className="text-xs !py-1 !mb-0"
                                    />
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
            )}
        </Card>
    );
};

export default LandlordMaintenanceView;