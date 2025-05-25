import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const TenantFormModal = ({ isOpen, onClose, onSubmit, existingTenant }) => {
    const [formData, setFormData] = useState({ 
      name: '', 
      email: '', 
      phone: '', 
      password: '' 
    });

    useEffect(() => {
        if (existingTenant) {
            setFormData({ 
                name: existingTenant.name || '',
                email: existingTenant.email || '',
                phone: existingTenant.phone || '',
                password: '' // Password field is only for new tenants
            });
        } else {
            setFormData({ name: '', email: '', phone: '', password: '' });
        }
    }, [existingTenant, isOpen]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => { 
        e.preventDefault(); 
        onSubmit(formData); 
    };

    return (
        <Modal 
          isOpen={isOpen} 
          onClose={onClose} 
          title={existingTenant ? `Edit Tenant: ${existingTenant.name}` : 'Create New Tenant'} 
          size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    label="Full Name" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                />
                {!existingTenant && (
                    <>
                        <Input 
                            label="Email" 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                        />
                        <Input 
                            label="Password" 
                            id="password" 
                            name="password" 
                            type="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            required={!existingTenant}
                            placeholder="Minimum 6 characters" 
                        />
                    </>
                )}
                <Input 
                    label="Phone Number" 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleChange} 
                />
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">
                        {existingTenant ? 'Save Changes' : 'Create Tenant'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TenantFormModal;