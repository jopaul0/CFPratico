// src/components/InputGroup.tsx
import React from 'react';
import { View, Text, TextInput, Platform } from 'react-native';
import { Option } from '../types/Filters';
// Importe o novo componente
import { CustomPicker } from './CustomPicker';

interface InputGroupProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';

  isSelect?: boolean;
  options?: Option[];
  currentValue?: string; // MUDAMOS: Era selectedValue, padronizei para currentValue
  onValueChange?: (value: string) => void;

  multiline?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = (props) => {
  const {
    label,
    placeholder,
    value,
    onChangeText,
    isSelect = false,
    options = [],
    currentValue, // <--
    onValueChange, // <--
    keyboardType = 'default',
    multiline = false,
  } = props;

  const BORDER_CLASS = 'border border-gray-300 bg-white';
  const CONTROL_HEIGHT = Platform.OS === 'android' ? 52 : 44;

  const inputNode = isSelect ? (
    // ------ SUBSTITUIÇÃO AQUI ------
    <CustomPicker
      label={label}
      options={options}
      selectedValue={currentValue ?? (options[0]?.value ?? '')}
      onValueChange={(val) => onValueChange?.(val)}
    />
  ) : (
    // O TextInput normal não muda
    <TextInput
      className={`w-full rounded-lg focus:outline-none ${BORDER_CLASS}`}
      placeholder={placeholder}
      value={value ?? ''}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      style={[
        { height: CONTROL_HEIGHT, paddingHorizontal: 12 },
        multiline && {
          minHeight: CONTROL_HEIGHT * 2,
          height: undefined,
          paddingVertical: 8,
          textAlignVertical: 'top',
        },
      ]}
    />
  );

  return (
    <View className="mb-3">
      {/* Se for select, o CustomPicker já renderiza o Label,
          então não precisamos de outro aqui */}
      {!isSelect && (
        <Text className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </Text>
      )}
      {inputNode}
    </View>
  );
};