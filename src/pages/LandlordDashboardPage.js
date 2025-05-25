import React, { useState } from 'react';
import { Building, Users, FileText, DollarSign, Wrench } from 'lucide-react';
import { generateId } from '../utils/helpers';
import { addHouse, updateHouse, deleteHouse } from '../services/houseService';
import { createTenantProfile, updateProfile, deleteProfile } from '../services/profileService';
import { addLease, updateLease, deleteLease } from '../services/leaseService';
import LandlordHousesView from '../features/landlord/components/LandlordHousesView';
import LandlordTenantsView from '../features/landlord/components/LandlordTenantsView';
import LandlordLeasesView from '../features/landlord/components/LandlordLeasesView';
import LandlordPaymentsView from '../features/landlord/components/LandlordPaymentsView';
import LandlordMaintenanceView from '../features/landlord/components/LandlordMaintenanceView';
import HouseFormModal from '../features/landlord/forms/HouseFormModal';
import TenantFormModal from '../features/landlord/forms/TenantFormModal';
import LeaseFormModal from '../features/landlord/forms/LeaseFormModal';

const LandlordDashboardPage = ({ currentUser, houses, tenants, leases, fetchAllDataForUser, setIsLoading }) => {
    const [activeTab, setActiveTab] = useState('houses');
    const [showHouseModal, setShowHouseModal] = useState(false);
    const [showTenantModal, setShowTenantModal] = useState(false);
    const [showLeaseModal, setShowLeaseModal] = useState(false);
    const [editingHouse, setEditingHouse] = useState(null);
    const [editingTenant, setEditingTenant] = useState(null);
    const [editingLease, setEditingLease] = useState(null);

    const handleAddOrUpdateHouse = async (houseDataFromForm) => {
        setIsLoading(true);
        let dataToSubmit = { ...houseDataFromForm, landlord_id: currentUser.id };
        if (dataToSubmit.type === 'Multi-Unit House') {
            dataToSubmit.units = (dataToSubmit.units || []).map(unit => ({ ...unit, id: unit.id || generateId() }));
            dataToSubmit.rooms = null;
        } else {
            dataToSubmit.units = null;
            if(dataToSubmit.rooms === '' || dataToSubmit.rooms === undefined || dataToSubmit.rooms === null){
                dataToSubmit.rooms = 1;
            }
        }
        try {
            if (editingHouse) {
                const { error } = await updateHouse(editingHouse.id, dataToSubmit);
                if (error) throw error;
                alert('House updated successfully!');
            } else {
                const { error } = await addHouse(dataToSubmit);
                if (error) throw error;
                alert('House added successfully!');
            }
            fetchAllDataForUser();
        } catch (error) {
            console.error('Error saving house:', error);
            alert('Failed to save house: ' + error.message);
        }
        setShowHouseModal(false);
        setEditingHouse(null);
        setIsLoading(false);
    };

    const handleAddOrUpdateTenant = async (tenantData) => {
        setIsLoading(true);
        try {
            if (editingTenant) {
                // Update existing tenant
                const { error } = await updateProfile(editingTenant.id, {
                    name: tenantData.name,
                    phone: tenantData.phone
                });
                if (error) throw error;
                alert('Tenant updated successfully!');
            } else {
                // Create new tenant
                const { data, error } = await createTenantProfile(tenantData, currentUser.id);
                if (error) throw error;
                alert('Tenant created successfully!');
            }
            fetchAllDataForUser();
        } catch (error) {
            console.error('Error saving tenant:', error);
            alert('Failed to save tenant: ' + error.message);
        }
        setShowTenantModal(false);
        setEditingTenant(null);
        setIsLoading(false);
    };

    const openEditHouseModal = (house) => { setEditingHouse(house); setShowHouseModal(true); };
    const openAddHouseModal = () => { setEditingHouse(null); setShowHouseModal(true); };
    const openAddTenantModal = () => { setEditingTenant(null); setShowTenantModal(true); };
    const openEditTenantModal = (tenant) => { setEditingTenant(tenant); setShowTenantModal(true); };

    const handleDeleteHouse = async (houseId) => {
        if (window.confirm("Are you sure you want to delete this house and ALL associated leases? This action cannot be undone.")) {
            setIsLoading(true);
            const { error } = await deleteHouse(houseId);
            if (error) {
                console.error('Error deleting house:', error);
                alert('Failed to delete house: ' + error.message);
            } else {
                fetchAllDataForUser();
                alert('House and associated leases deleted successfully.');
            }
            setIsLoading(false);
        }
    };

    const handleDeleteTenantAndLeases = async (tenantProfileId) => {
        if (window.confirm("Are you sure you want to delete this tenant profile AND ALL THEIR LEASES? This is a major action.")) {
            setIsLoading(true);
            const tenantLeases = leases.filter(l => l.tenant_id === tenantProfileId);
            for (const lease of tenantLeases) {
                const { error: leaseDelError } = await deleteLease(lease.id);
                if (leaseDelError) console.warn(`Could not delete lease ${lease.id} for tenant ${tenantProfileId}: ${leaseDelError.message}`);
            }
            const { error: profileError } = await deleteProfile(tenantProfileId);
            if (profileError) {
                console.error('Error deleting tenant profile:', profileError);
                alert('Failed to delete tenant profile: ' + profileError.message + '. Some leases might have been deleted.');
            } else {
                fetchAllDataForUser();
                alert('Tenant profile and associated leases deleted successfully.');
            }
            setIsLoading(false);
        }
    };

    const handleAddOrUpdateLease = async (leaseDataFromForm) => {
        setIsLoading(true);
        delete leaseDataFromForm.houses;
        delete leaseDataFromForm.tenant;
        const dataToSubmit = { 
            ...leaseDataFromForm,
            landlord_id: currentUser.id,
            rent_amount: parseFloat(leaseDataFromForm.rent_amount) || 0,
            deposit: parseFloat(leaseDataFromForm.deposit) || 0,
        };

        try {
            if (editingLease) {
                const { error } = await updateLease(editingLease.id, dataToSubmit);
                if (error) throw error;
                alert('Lease updated successfully!');
            } else {
                const { error } = await addLease(dataToSubmit);
                if (error) throw error;
                alert('Lease created successfully!');
            }
            fetchAllDataForUser();
        } catch (error) {
            console.error('Error saving lease:', error);
            alert('Failed to save lease: ' + error.message);
        }
        setShowLeaseModal(false);
        setEditingLease(null);
        setIsLoading(false);
    };

    const openEditLeaseModal = (lease) => { setEditingLease(lease); setShowLeaseModal(true); };
    const openAddLeaseModal = () => { setEditingLease(null); setShowLeaseModal(true); };

    const handleDeleteLease = async (leaseId) => {
        if (window.confirm("Are you sure you want to delete this lease?")) {
            setIsLoading(true);
            const { error } = await deleteLease(leaseId);
            if (error) {
                console.error('Error deleting lease:', error);
                alert('Failed to delete lease: ' + error.message);
            } else {
                fetchAllDataForUser();
                alert('Lease deleted successfully.');
            }
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'houses', label: 'Houses', icon: Building },
        { id: 'tenants', label: 'Tenants', icon: Users },
        { id: 'leases', label: 'Leases', icon: FileText },
        { id: 'payments', label: 'Payments', icon: DollarSign },
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Landlord Dashboard</h1>
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto pb-1" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-sky-500 text-sky-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center group`}
                        >
                            <tab.icon size={18} className={`mr-2 ${activeTab === tab.id ? 'text-sky-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            {activeTab === 'houses' && (
                <LandlordHousesView 
                    houses={houses} 
                    onAdd={openAddHouseModal} 
                    onEdit={openEditHouseModal} 
                    onDelete={handleDeleteHouse} 
                    leases={leases} 
                />
            )}
            {activeTab === 'tenants' && (
                <LandlordTenantsView 
                    tenants={tenants.filter(t => t.role === 'tenant')} 
                    onAdd={openAddTenantModal}
                    onEdit={openEditTenantModal} 
                    onDelete={handleDeleteTenantAndLeases} 
                    leases={leases} 
                    houses={houses} 
                />
            )}
            {activeTab === 'leases' && (
                <LandlordLeasesView 
                    leases={leases} 
                    tenants={tenants} 
                    houses={houses} 
                    onAdd={openAddLeaseModal} 
                    onEdit={openEditLeaseModal} 
                    onDelete={handleDeleteLease} 
                />
            )}
            {activeTab === 'payments' && (
                <LandlordPaymentsView 
                    leases={leases} 
                    tenants={tenants} 
                    houses={houses} 
                    setIsLoading={setIsLoading} 
                />
            )}
            {activeTab === 'maintenance' && (
                <LandlordMaintenanceView 
                    leases={leases} 
                    tenants={tenants} 
                    houses={houses} 
                    setIsLoading={setIsLoading} 
                />
            )}
            <HouseFormModal 
                isOpen={showHouseModal} 
                onClose={() => { setShowHouseModal(false); setEditingHouse(null); }} 
                onSubmit={handleAddOrUpdateHouse} 
                existingHouse={editingHouse} 
            />
            <TenantFormModal 
                isOpen={showTenantModal} 
                onClose={() => { setShowTenantModal(false); setEditingTenant(null); }} 
                onSubmit={handleAddOrUpdateTenant} 
                existingTenant={editingTenant} 
            />
            <LeaseFormModal 
                isOpen={showLeaseModal} 
                onClose={() => { setShowLeaseModal(false); setEditingLease(null); }} 
                onSubmit={handleAddOrUpdateLease} 
                existingLease={editingLease} 
                houses={houses} 
                tenants={tenants.filter(t => t.role === 'tenant')} 
            />
        </div>
    );
};

export default LandlordDashboardPage;