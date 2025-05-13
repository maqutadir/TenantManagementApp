import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import Button from '../../../components/ui/Button';

const MaintenanceRequestModal = ({ isOpen, onClose, onSubmit, activeLeases, currentUser }) => {
    const [formData, setFormData] = useState({
        lease_id: '', 
         description: '',
        priority: 'Medium'
    });

    useEffect(() => {
        if (isOpen && activeLeases.length > 0) {
            if (!formData.lease_id || !activeLeases.find(l => l.id.toString() === formData.lease_id)) {
                 setFormData(prev => ({ ...prev, lease_id: activeLeases[0].id.toString() }));
            }
        }
    }, [isOpen, activeLeases, formData.lease_id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.lease_id || !formData.description) {
            alert("Please select your lease and provide a description.");
            return;
        }

        const selectedLease = activeLeases.find(l => l.id.toString() === formData.lease_id);
        if (!selectedLease) {
            alert("Selected lease not found.");
            return;
        }

        const payload = {
            lease_id: parseInt(formData.lease_id),
            house_id: selectedLease.house_id,
             tenant_id: currentUser.id,
            description: formData.description,
            priority: formData.priority,
            status: 'Open',  
           submitted_date: new Date().toISOString().split('T')[0],
        };

        onSubmit(payload);
    };

    const leaseOptions = activeLeases.map(l => {
        const houseName = l.houses?.name || 'N/A';
         return { value: l.id.toString(), label: `${houseName} - Unit/Room: ${l.room_or_unit_id}` };
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Submit Maintenance Request" size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label="Select Lease/Property"
                    id="lease_id"
                    name="lease_id"
                    value={formData.lease_id}
                    onChange={handleChange}
                    options={leaseOptions}
                    required
                 />
                <Textarea
                    label="Describe the issue"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />
                <Select
                    label="Priority"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    options={[
                        { value: 'Low', label: 'Low' },
                        { value: 'Medium', label: 'Medium' },
                        { value: 'High', label: 'High' }
                    ]}
                    required
                />
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">Submit Request</Button>
                </div>
            </form>
        </Modal>
    );
};

export default MaintenanceRequestModal;