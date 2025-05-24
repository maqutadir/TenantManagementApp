import React from 'react';

const Card = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white rounded-xl shadow-soft overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;