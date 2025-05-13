import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const LeaseFormModal = ({ isOpen, onClose, onSubmit, existingLease, houses, tenants }) => {
    const initialFormData = { house_id: '', tenant_id: '', room_or_unit_id: '', rent_amount: '', lease_start_date: '', lease_end_date: '', deposit: '', status: 'pending' };
    const [formData, setFormData] = useState(initialFormData);
    const [selectedHouseDetails, setSelectedHouseDetails] = useState(null);

    useEffect(() => {
        if (existingLease) {
            setFormData({
                ...initialFormData, 
                 ...existingLease,
                house_id: existingLease.house_id?.toString() || '',
                tenant_id: existingLease.tenant_id?.toString() || '',
                lease_start_date: existingLease.lease_start_date ? existingLease.lease_start_date.split('T')[0] : '', 
                 lease_end_date: existingLease.lease_end_date ? existingLease.lease_end_date.split('T')[0] : '',
             });
            const house = houses.find(h => h.id === parseInt(existingLease.house_id));
            setSelectedHouseDetails(house || null);
        } else {
            setFormData(initialFormData);
            setSelectedHouseDetails(null);
        }
    }, [existingLease, isOpen, houses]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === "house_id") {
            const house = houses.find(h => h.id === parseInt(value));
            setSelectedHouseDetails(house || null);
            setFormData(prev => ({ ...prev, room_or_unit_id: '' }));
         }
    };

    const handleSubmit = e => { e.preventDefault(); onSubmit(formData); };

    const houseOptions = Array.isArray(houses) ?
        houses.map(h => ({ value: h.id.toString(), label: `${h.name} (${h.address})` })) : [];
    const tenantOptions = Array.isArray(tenants) ?
        tenants.map(t => ({ value: t.id.toString(), label: `${t.name} (${t.email})` })) : [];

    const statusOptions = [
        { value: 'pending', label: 'Pending' }, { value: 'active', label: 'Active' },
        { value: 'ended', label: 'Ended' }, { value: 'cancelled', label: 'Cancelled' }
    ];

    const roomOrUnitLabel = selectedHouseDetails?.type === 'Multi-Unit House' ? "Select Unit" : "Room Number/Identifier";
    let unitOptions = [];
    if (selectedHouseDetails?.type === 'Multi-Unit House' && selectedHouseDetails.units && Array.isArray(selectedHouseDetails.units)) {
        unitOptions = selectedHouseDetails.units.map(unit => ({ value: unit.number, label: `${unit.number} (${unit.size || 'N/A'})` }));
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={existingLease ? 'Edit Lease' : 'Create New Lease'} size="xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="House" id="house_id" name="house_id" value={formData.house_id} onChange={handleChange} options={houseOptions} required />
                    <Select label="Tenant" id="tenant_id" name="tenant_id" value={formData.tenant_id} onChange={handleChange} options={tenantOptions} required />
                </div>
                {selectedHouseDetails?.type === 'Multi-Unit House' && unitOptions.length > 0 ? (
                     <Select label={roomOrUnitLabel} id="room_or_unit_id" name="room_or_unit_id" value={formData.room_or_unit_id} onChange={handleChange} options={unitOptions} required selectPlaceholder="Select unit" />
                ) : (
                    <Input label={roomOrUnitLabel} id="room_or_unit_id" name="room_or_unit_id" value={formData.room_or_unit_id} onChange={handleChange} placeholder={selectedHouseDetails?.type === 'Multi-Unit House' ? "Enter Unit ID" : "e.g., Room 3B"} required />
                )}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Rent Amount (USD per month)" id="rent_amount" name="rent_amount" type="number" value={formData.rent_amount} onChange={handleChange} required step="0.01" min="0"/>
                    <Input label="Security Deposit (USD)" id="deposit" name="deposit" type="number" value={formData.deposit} onChange={handleChange} step="0.01" min="0"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Lease Start Date" id="lease_start_date" name="lease_start_date" type="date" value={formData.lease_start_date} onChange={handleChange} required />
                    <Input label="Lease End Date" id="lease_end_date" name="lease_end_date" type="date" value={formData.lease_end_date} onChange={handleChange} required />
                </div>
                {existingLease && (
                     <Select label="Lease Status" id="status" name="status" value={formData.status} onChange={handleChange} options={statusOptions} required />
                )}
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">{existingLease ? 'Save Changes' : 'Create Lease'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default LeaseFormModal;