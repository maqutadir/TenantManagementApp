import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const PaymentFormModal = ({ isOpen, onClose, onSubmit, lease }) => {
    const [formData, setFormData] = useState({
        amount: lease?.rent_amount || '',
        payment_date: new Date().toISOString().split('T')[0],
        method: 'cash'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            lease_id: lease.id,
            amount: parseFloat(formData.amount)
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Submit Cash Payment" size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Amount (USD)"
                    id="amount"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                />
                <Input
                    label="Payment Date"
                    id="payment_date"
                    name="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={handleChange}
                    required
                />
                <Select
                    label="Payment Method"
                    id="method"
                    name="method"
                    value={formData.method}
                    onChange={handleChange}
                    options={[{ value: 'cash', label: 'Cash' }]}
                    required
                    disabled
                />
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">Submit Payment</Button>
                </div>
            </form>
        </Modal>
    );
};

export default PaymentFormModal;