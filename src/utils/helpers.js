// src/utils/helpers.js
export const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  return date.toLocaleDateString();
};

export const generateId = () => `U${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3)}`;

export const calculateDaysRemaining = (endDate) => {
  if (!endDate) return 0;
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

export const getLeaseStatusColor = (daysRemaining) => {
  if (daysRemaining > 90) return 'text-green-600';
  if (daysRemaining > 30) return 'text-yellow-600';
  return 'text-red-600';
};