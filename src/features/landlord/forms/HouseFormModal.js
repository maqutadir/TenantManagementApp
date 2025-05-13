import React, { useState, useEffect } from 'react';
import { PlusCircle, XCircle } from 'lucide-react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Textarea from '../../../components/ui/Textarea';
import Button from '../../../components/ui/Button';
import { generateId } from '../../../utils/helpers';

const HouseFormModal = ({ isOpen, onClose, onSubmit, existingHouse }) => {
    const getInitialFormData = () => {
        const baseData = { name: '', address: '', type: 'Shared House', rooms: 1, notes: '', units: [] };
        if (existingHouse) {
            return { 
                 ...baseData, 
                 ...existingHouse,
                 units: existingHouse.units ? JSON.parse(JSON.stringify(existingHouse.units)) : [],
                rooms: existingHouse.type === 'Multi-Unit House' ? (existingHouse.rooms || 1) : (existingHouse.rooms || 1)
            };
        }
        return baseData;
    };

    const [formData, setFormData] = useState(getInitialFormData());
    const [newUnit, setNewUnit] = useState({ number: '', size: '', notes: '' });

    useEffect(() => {
        setFormData(getInitialFormData());
    }, [existingHouse, isOpen]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleUnitChange = (index, e) => {
        const updatedUnits = [...formData.units];
        updatedUnits[index] = { ...updatedUnits[index], [e.target.name]: e.target.value };
        setFormData({ ...formData, units: updatedUnits });
    };

    const handleAddUnit = () => {
        if (!newUnit.number || !newUnit.size) {
            alert("Unit Number and Size are required to add a unit.");
            return;
        }
        setFormData({ ...formData, units: [...formData.units, { ...newUnit, id: generateId() }] });
        setNewUnit({ number: '', size: '', notes: '' });
    };
     const handleNewUnitChange = e => setNewUnit({ ...newUnit, [e.target.name]: e.target.value });

    const handleRemoveUnit = (index) => {
        const updatedUnits = formData.units.filter((_, i) => i !== index);
        setFormData({ ...formData, units: updatedUnits });
    };

    const handleSubmit = e => { 
         e.preventDefault();
        const dataToSubmit = { ...formData };
        dataToSubmit.units = dataToSubmit.type === 'Multi-Unit House' ? (dataToSubmit.units || []) : null;
        dataToSubmit.rooms = dataToSubmit.type !== 'Multi-Unit House' ? (parseInt(dataToSubmit.rooms, 10) || 1) : null;
        onSubmit(dataToSubmit);
    };

    const houseTypeOptions = [
        { value: 'Shared House', label: 'Shared House (Rooms)' }, 
         { value: 'Multi-Unit House', label: 'Multi-Unit House (Apartments/Flats)' },
        { value: 'Single Family Home', label: 'Single Family Home' }, 
         { value: 'Student Housing', label: 'Student Housing (Rooms)' },
        { value: 'Townhouse', label: 'Townhouse' },
        { value: 'Condominium', label: 'Condominium Unit' }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={existingHouse ? 'Edit House' : 'Add New House'} size="xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <Input label="House Name" id="name" name="name" value={formData.name} onChange={handleChange} required />
                    <Select label="House Type" id="type" name="type" value={formData.type} onChange={handleChange} options={houseTypeOptions} required />
                </div>
                <Input label="Address" id="address" name="address" value={formData.address} onChange={handleChange} required />
                                 {formData.type !== 'Multi-Unit House' && (
                    <Input label="Number of Rooms" id="rooms" name="rooms" type="number" value={formData.rooms || 1} onChange={handleChange} required min="1" />
                )}
                {formData.type === 'Multi-Unit House' && (
                    <div className="mt-4 pt-4 border-t">
                        <h3 className="text-md font-semibold text-gray-700 mb-3">Manage Units ({formData.units?.length || 0} defined)</h3>
                        {formData.units?.map((unit, index) => (
                            <div key={unit.id || index} className="p-3 mb-3 border rounded-md bg-slate-50 space-y-2 relative">
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveUnit(index)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    title="Remove Unit"
                                >        
                                    <XCircle size={20} />
                                </button>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3">
                                    <Input label={`Unit #${index + 1} Number/ID`} id={`unit-number-${index}`} name="number" value={unit.number} onChange={(e) => handleUnitChange(index, e)} placeholder="e.g., A101, Unit B" required/>
                                    <Input label="Size" id={`unit-size-${index}`} name="size" value={unit.size} onChange={(e) => handleUnitChange(index, e)} placeholder="e.g., 2BHK, Studio" required/>
                                    <Input label="Notes (optional)" id={`unit-notes-${index}`} name="notes" value={unit.notes} onChange={(e) => handleUnitChange(index, e)} placeholder="Unit-specific notes"/>
                                </div>
                            </div>
                        ))}
                        <div className="p-3 border rounded-md border-dashed border-sky-400 mt-2">
                            <h4 className="text-sm font-semibold text-gray-600 mb-2">Add New Unit:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3 items-end">
                                <Input label="Unit Number/ID" id="new-unit-number" name="number" value={newUnit.number} onChange={handleNewUnitChange} placeholder="e.g., C205"/>
                                <Input label="Size" id="new-unit-size" name="size" value={newUnit.size} onChange={handleNewUnitChange} placeholder="e.g., 1BHK, 3 Bed"/>
                                <Input label="Notes (optional)" id="new-unit-notes" name="notes" value={newUnit.notes} onChange={handleNewUnitChange} />
                            </div>
                            <Button type="button" variant="secondary" size="sm" onClick={handleAddUnit} className="mt-2" icon={PlusCircle}>Add This Unit</Button>
                        </div>
                    </div>
                )}
                <Textarea label="General House Notes" id="notes" name="notes" value={formData.notes} onChange={handleChange} />
                <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary">{existingHouse ? 'Save Changes' : 'Add House'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default HouseFormModal;