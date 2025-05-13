import React from 'react';

const Button = ({ onClick, children, variant = 'primary', className = '', icon: Icon, type = "button", size = "md", disabled = false }) => {
  const baseStyle = 'rounded-lg font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400',
    ghost: 'bg-transparent hover:bg-gray-100 text-blue-600 focus:ring-blue-500',
    link: 'bg-transparent text-blue-600 hover:underline focus:ring-blue-500 p-0 shadow-none',
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${sizeStyles[size]} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={size === 'sm' ? 14 : 18} className="mr-1" />}
      {children}
    </button>
  );
};

export default Button;