import React from 'react';
import { FilePlus, Edit3, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { formatDate, formatCurrency } from '../../../utils/helpers';

const LandlordLeasesView = ({ leases, tenants, houses, onAdd, onEdit, onDelete }) => (
    <Card title="Manage Leases">
        <Button onClick={onAdd} icon={FilePlus} className="mb-6">Create New Lease</Button>
        {!Array.isArray(leases) || leases.length === 0 ? <p className="text-gray-500">No leases created yet.</p> : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">House</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room/Unit ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates (Start - End)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leases.map(lease => {
                            const house = Array.isArray(houses) ?
                            houses.find(h => h.id === lease.house_id) : null;
                            const tenantProfile = Array.isArray(tenants) ? tenants.find(t => t.id === lease.tenant_id) : null;
                            const statusColor = lease.status === 'active' ? 'text-green-600 bg-green-100' : lease.status === 'pending' ? 'text-yellow-600 bg-yellow-100' : 'text-red-600 bg-red-100';
                            return (
                                <tr key={lease.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{house ? house.name : 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lease.room_or_unit_id}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{tenantProfile ? tenantProfile.name : 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatCurrency(lease.rent_amount)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(lease.lease_start_date)} - {formatDate(lease.lease_end_date)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor} capitalize`}>{lease.status}</span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                                        <Button onClick={() => onEdit(lease)} icon={Edit3} size="sm" variant="ghost" className="text-yellow-600 hover:text-yellow-700">Edit</Button>
                                        <Button onClick={() => onDelete(lease.id)} icon={Trash2} size="sm" variant="ghost" className="text-red-600 hover:text-red-700">Delete</Button>
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

export default LandlordLeasesView;