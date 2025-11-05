import React from 'react';

export const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => (
  <div className="mb-4 p-4 bg-white rounded-lg shadow">
    <h3 className="text-base font-semibold text-gray-800 mb-2">{q}</h3>
    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{a}</p>
  </div>
);