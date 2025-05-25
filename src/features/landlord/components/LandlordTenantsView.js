import React from 'react';
import { UserPlus, Edit3, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const LandlordTenantsView = ({ tenants, onAdd, onEdit, onDelete, leases, houses }) => (
    <Card title="Manage Tenants">
        <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500">Create and manage your tenants here.</p>
            <Button onClick={onAdd} icon={UserPlus}>Add New Tenant</Button>
        </div>
        {tenants.length === 0 ? <p className="text-gray-500">No tenants found.</p> : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Lease(s)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {tenants.map(tenant => {
                            const tenantLeases = Array.isArray(leases) ?
                            leases.filter(l => l.tenant_id === tenant.id && l.status === 'active') : [];
                            const leaseDetails = tenantLeases.map(l => {
                                const house = Array.isArray(houses) ? houses.find(h => h.id === l.house_id) : null;
                                return `${house ? house.name : 'N/A'} (${l.room_or_unit_id || 'N/A'})`;
                            }).join(', ');
                            return (
                                <tr key={tenant.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{tenant.email}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{tenant.phone}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{leaseDetails || 'None'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Button onClick={() => onEdit(tenant)} icon={Edit3} size="sm" variant="ghost" className="text-yellow-600 hover:text-yellow-700">Edit</Button>
                                        <Button onClick={() => onDelete(tenant.id)} icon={Trash2} size="sm" variant="ghost" className="text-red-600 hover:text-red-700">Delete</Button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )}
    </Card>
);

export default LandlordTenantsView;