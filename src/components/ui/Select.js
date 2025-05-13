import React from 'react';

const Select = ({ label, id, value, onChange, options, required = false, className = '', name, error, placeholder: selectPlaceholder }) => {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
            <select
                id={id}
                name={name || id}
                value={value}
                onChange={onChange}
                required={required}
                className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${className}`}
            >
                <option value="">{selectPlaceholder || `-- Select ${label} --`}</option>
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default Select;