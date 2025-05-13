import React from 'react';

const Card = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white shadow-lg rounded-xl ${className}`}>
      {title && <h2 className="text-xl font-semibold text-gray-700 p-4 border-b border-gray-200">{title}</h2>}
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
};

export default Card;