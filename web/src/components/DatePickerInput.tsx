// src/components/DatePickerInput.tsx
// Traduzido de
// A versão web é MUITO mais simples.

import React from 'react';

interface DatePickerInputProps {
  label: string;
  value: string; // Espera 'YYYY-MM-DD'
  onChange: (dateString: string) => void;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const CONTROL_HEIGHT = '44px'; // h-11

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {/* Usamos o <input type="date"> nativo do navegador */}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ minHeight: CONTROL_HEIGHT }}
      />
    </div>
  );
};