// src/components/DatePickerInput.tsx
import React, { useState } from 'react';
import { View, Text, Platform, Pressable } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { formatDateToString, parseStringToDate } from '../utils/Date';

interface DatePickerInputProps {
  label: string;
  value: string;
  onChange: (dateString: string) => void;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
}) => {
  const [show, setShow] = useState(false);
  const currentDate = parseStringToDate(value);

  const hideDatePicker = () => setShow(false);
  const showDatePicker = () => setShow(true);

  const handleConfirm = (selectedDate: Date) => {
    if (selectedDate) {
      const newDateString = formatDateToString(selectedDate);
      onChange(newDateString);
    }
    hideDatePicker();
  };

  // Exibição formatada (DD/MM/YYYY)
  const displayValue = value
    ? value.split('-').reverse().join('/')
    : 'Selecionar data';

  const CONTROL_HEIGHT = Platform.OS === 'android' ? 52 : 44;

  return (
    <View className="mb-3">
      <Text className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </Text>
      <Pressable
        onPress={showDatePicker}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 justify-center"
        style={{ minHeight: CONTROL_HEIGHT }}
      >
        <Text
          className={`text-sm ${
            value ? 'text-gray-800' : 'text-gray-400'
          } font-medium`}
        >
          {displayValue}
        </Text>
      </Pressable>

      <DateTimePickerModal
        isVisible={show}
        mode="date"
        date={currentDate}
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        confirmTextIOS="Confirmar"
        cancelTextIOS="Cancelar"
      />
    </View>
  );
};