import React from 'react';
import { View, Text, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface InputGroupProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';

  isSelect?: boolean;
  options?: { label: string; value: string }[];
  currentValue?: string;
  onValueChange?: (value: string) => void;

  multiline?: boolean;
}

export const InputGroup: React.FC<InputGroupProps> = ({
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
}) => {
  const BORDER_CLASS = 'border border-gray-300 bg-white shadow-sm';
  const CONTROL_HEIGHT = Platform.OS === 'android' ? 52 : 44;

  const RenderInput = () => {
    if (isSelect) {
      const pickerValue = currentValue ?? (options.length > 0 ? options[0].value : '');

      return (
        <View
          // Aplica borda ao View para conter o Picker
          className={`w-full rounded-lg ${BORDER_CLASS} justify-center`}
          style={{ minHeight: CONTROL_HEIGHT, paddingHorizontal: 12 }}
        >
          <Picker
            mode="dropdown"
            selectedValue={pickerValue}
            onValueChange={onValueChange}
            style={{ height: CONTROL_HEIGHT, width: '100%' }}
            dropdownIconColor="#6b7280"
          >
            {options.map((o) => (
              <Picker.Item key={o.value} label={o.label} value={o.value} />
            ))}
          </Picker>
        </View>
      );
    }

    // Para TextInput, aplicamos as classes de borda e altura DIRETAMENTE no TextInput
    return (
      <TextInput
        className={`w-full rounded-lg ${BORDER_CLASS}`} // Borda e fundo aplicados diretamente
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        // Configurações de estilo para altura e padding
        style={[
          { height: CONTROL_HEIGHT, paddingHorizontal: 12 },
          multiline && {
            minHeight: CONTROL_HEIGHT * 2, // Aumenta a altura mínima para multiline
            height: undefined,
            paddingVertical: 8,
            textAlignVertical: 'top',
          },
        ]}
      />
    );
  };

  return (
    <View className="mb-3">
      <Text className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </Text>
      <RenderInput />
    </View>
  );
};