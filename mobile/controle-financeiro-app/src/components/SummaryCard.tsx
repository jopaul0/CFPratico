import React from 'react';
import { View, Text } from 'react-native';

interface SummaryCardProps {
  title: string;
  value: number;
  valueColorClass: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, valueColorClass }) => {
  const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <View className="w-full p-2 sm:w-1/3">
      <View className="bg-white rounded-xl shadow-md p-5">
        <Text className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </Text>
        <Text className={`text-3xl font-bold mt-2 ${valueColorClass}`}>
          {formattedValue}
        </Text>
      </View>
    </View>
  );
};