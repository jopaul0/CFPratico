// src/components/InputGroup.tsx
import React from 'react';
import { Option } from '../types/Filters';
import { CustomPicker } from './CustomPicker';

interface InputGroupProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  isSelect?: boolean;
  options?: Option[];
  currentValue?: string;
  onValueChange?: (value: string) => void;
}

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
  } = props;

  // --- INÍCIO DA CORREÇÃO ---
  
  // O <input type="number"> não aceita valores formatados com vírgula (ex: "1.234,56").
  // Vamos usar type="text" para todos e controlar o teclado virtual com `inputMode`.
  const inputType = 'text';
  let inputMode: 'numeric' | 'decimal' | 'text' = 'text';

  if (keyboardType === 'numeric') {
    // "decimal" é ideal para valores monetários
    // "numeric" é para inteiros (como Parcelas)
    const labelLower = (label || '').toLowerCase();
    const placeholderLower = (placeholder || '').toLowerCase();

    if (labelLower.includes('valor') || placeholderLower.includes(',')) {
        inputMode = 'decimal';
    } else {
        inputMode = 'numeric';
    }
  }
  // --- FIM DA CORREÇÃO ---


  const inputNode = isSelect ? (
    <CustomPicker
      label={label}
      options={options}
      selectedValue={currentValue ?? ''}
      onValueChange={(val) => onValueChange?.(val)}
    />
  ) : (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={inputType} // Corrigido
        inputMode={inputMode} // Adicionado
        className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChangeText?.(e.target.value)}
      />
    </div>
  );

  return isSelect ? inputNode : <div className="mb-3">{inputNode}</div>;
};