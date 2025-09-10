import React from 'react';

export const MetricCard = ({ title, value, description, colorClass = 'text-ifce-gray-dark' }) => (
  <div className="bg-ifce-gray-light p-4 rounded-lg">
    <p className="text-sm text-slate-600">{title}</p>
    <p className={`text-3xl font-bold mt-1 ${colorClass}`}>
      {value}
    </p>
    {description && (
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    )}
  </div>
);