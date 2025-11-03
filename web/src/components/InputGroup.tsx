// src/components/InputGroup.tsx
// Traduzido de
// <TextInput> vira <input> e <Picker> vira <select>

import React from 'react';

type Option = { label: string; value: string | number };

interface InputGroupProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address';

  isSelect?: boolean;
  options?: Option[];
  currentValue?: string | number;
  onValueChange?: (value: string) => void;

  multiline?: boolean;
}

const CONTROL_HEIGHT = '44px'; // h-11

export const InputGroup: React.FC<InputGroupProps> = (props) => {
  const {
    label,
    placeholder,
    value,
    onChangeText,
    isSelect = false,
    options = [],
    currentValue,
    onValueChange,
    keyboardType = 'default',
    multiline = false,
  } = props;

  const BORDER_CLASS =
    'border border-gray-300 bg-white rounded-lg w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  const inputNode = isSelect ? (
    <select
      value={currentValue}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={`${BORDER_CLASS}`}
      style={{ minHeight: CONTROL_HEIGHT }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ) : multiline ? (
    <textarea
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChangeText?.(e.target.value)}
      className={`${BORDER_CLASS} align-top`} // align-top é importante
      rows={3}
    />
  ) : (
    <input
      type={keyboardType === 'numeric' ? 'number' : 'text'}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={(e) => onChangeText?.(e.target.value)}
      className={`${BORDER_CLASS}`}
      style={{ minHeight: CONTROL_HEIGHT }}
    />
  );

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {inputNode}
    </div>
  );
};