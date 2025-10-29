import React from 'react';
import { View, Text, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { Option } from '../types/Filters'; 

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

  multiline?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = (props) => {
  const {
    label, placeholder, value, onChangeText,
    isSelect = false, options = [], currentValue, onValueChange,
    keyboardType = 'default', multiline = false,
  } = props;

  const BORDER_CLASS = 'border border-gray-300 bg-white';
  const CONTROL_HEIGHT = Platform.OS === 'android' ? 52 : 44;

  const inputNode = isSelect ? (
    <View
      className={`w-full rounded-lg ${BORDER_CLASS} justify-center`}
      style={{ minHeight: CONTROL_HEIGHT, paddingHorizontal: 12 }}
    >
      <Picker
        mode="dropdown"
        selectedValue={currentValue ?? (options[0]?.value ?? '')}
        onValueChange={onValueChange}
        className='focus:outline-none'
        style={{ height: CONTROL_HEIGHT, width: '100%' }}
        dropdownIconColor="#6b7280"
      >
        {options.map(o => (
          // Como o tipo Option é { label: string; value: string }, isso funciona
          <Picker.Item key={o.value} label={o.label} value={o.value} /> 
        ))}
      </Picker>
    </View>
  ) : (
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
      <Text className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </Text>
      {inputNode}
    </View>
  );
};