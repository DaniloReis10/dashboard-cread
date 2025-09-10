import React from 'react';

export const Card = ({ children, className, ...props }) => (
  <div 
    className={`
      bg-white dark:bg-dark-card 
      rounded-lg border border-ifce-gray-medium dark:border-dark-border 
      shadow-sm transition-shadow hover:shadow-md
      ${className}
    `}
    {...props}
  >
    {children}
  </div>
);