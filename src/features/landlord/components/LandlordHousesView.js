import React from 'react';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

const LandlordHousesView = ({ houses, onAdd, onEdit, onDelete, leases }) => (
    <Card title="Manage Houses">
        <Button onClick={onAdd} icon={PlusCircle} className="mb-6">Add New House</Button>
        {houses.length === 0 ? <p className="text-gray-500">No houses added yet.</p> : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms/Units</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Leases</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {houses.map(house => {
                            const activeLeaseCount = Array.isArray(leases) ?
                            leases.filter(l => l.house_id === house.id && l.status === 'active').length : 0;
                            const roomsOrUnitsDisplay = house.type === 'Multi-Unit House' ?
                            `${house.units?.length || 0} Units` : `${house.rooms || 0} Rooms`;
                            return (
                                <tr key={house.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{house.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{house.address}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{house.type}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{roomsOrUnitsDisplay}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{activeLeaseCount}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-1">
                                        <Button onClick={() => onEdit(house)} icon={Edit3} size="sm" variant="ghost" className="text-yellow-600 hover:text-yellow-700">Edit</Button>
                                        <Button onClick={() => onDelete(house.id)} icon={Trash2} size="sm" variant="ghost" className="text-red-600 hover:text-red-700">Delete</Button>
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

export default LandlordHousesView;