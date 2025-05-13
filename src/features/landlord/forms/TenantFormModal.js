import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const TenantFormModal = ({ isOpen, onClose, onSubmit, existingTenant }) => {
    const [formData, setFormData] = useState({ name: '', phone: '' });

    useEffect(() => {
        if (existingTenant) {
            setFormData({ 
                 name: existingTenant.name || '',
                 phone: existingTenant.phone || '',
            });
        } else {
            setFormData({ name: '', phone: ''});
        }
    }, [existingTenant, isOpen]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSubmit(formData); };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={existingTenant ? `Edit Tenant: ${existingTenant.name || existingTenant.email}` : 'Tenant Details'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                 {existingTenant && <p className="text-sm text-gray-600">Email: {existingTenant.email} (Cannot be changed here)</p>}
                <Input label="Full Name" id="name" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Phone Number" id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    {existingTenant && <Button type="submit" variant="primary">Save Changes</Button>}
                </div>
            </form>
        </Modal>
    );
};

export default TenantFormModal;