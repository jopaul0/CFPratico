import React from 'react';
import type { Option } from '../types/Filters';

interface CustomPickerProps {
  label: string;
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

export const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
}) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={selectedValue}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};