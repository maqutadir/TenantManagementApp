import React from 'react';

const Select = ({ label, id, value, onChange, options, required = false, className = '', name, error, placeholder: selectPlaceholder }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        required={required}
        className={`
          w-full px-3 py-2
          bg-white border
          ${error ? 'border-red-500' : 'border-gray-300'}
          rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:bg-gray-50 disabled:text-gray-500
          transition-colors duration-200
          ${className}
        `}
      >
        <option value="">{selectPlaceholder || `-- Select ${label} --`}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;