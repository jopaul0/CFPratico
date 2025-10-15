import React from 'react';
import { View, Text, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Importação do Picker

interface InputGroupProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  
  // Propriedades para Select (Picker)
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
  multiline = false
}) => {

  // Classe base para input/select
  const baseInputClass = "w-full rounded-lg border border-gray-300 bg-white shadow-sm";
  
  const RenderInput = () => {
    // ------------------------------------
    // 1. RENDERIZAÇÃO DO PICKER (SELECT)
    // ------------------------------------
    if (isSelect) {
        // O Picker requer que o valor inicial seja definido
        const pickerValue = currentValue || (options.length > 0 ? options[0].value : undefined);

        return (
            <View className={`${baseInputClass} overflow-hidden`}>
                <Picker
                    selectedValue={pickerValue}
                    onValueChange={onValueChange}
                    // Estilos para o Picker para garantir que ele seja visível
                    style={{ height: 40, width: '100%', color: '#1f2937' }} 
                    itemStyle={{ height: 40 }}
                >
                    {/* Adiciona uma opção para "Todos" se for um filtro, ou a primeira opção */}
                    {options.map(option => (
                        <Picker.Item 
                            key={option.value} 
                            label={option.label} 
                            value={option.value} 
                        />
                    ))}
                </Picker>
            </View>
        );
    }
    
    // ------------------------------------
    // 2. RENDERIZAÇÃO DO TEXTINPUT (INPUT NORMAL / DATA)
    // ------------------------------------
    return (
        <TextInput
            className={`${baseInputClass} py-2 px-3`}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            multiline={multiline}
            style={multiline ? { minHeight: 80 } : {height: 40}}
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