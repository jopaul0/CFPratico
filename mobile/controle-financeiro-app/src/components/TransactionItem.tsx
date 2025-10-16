import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Car, Utensils, CreditCard, DollarSign } from 'lucide-react-native';
import type { ISODate } from '../types/Date';

interface TransactionItemProps {
  id: string;
  category: 'transporte' | 'alimentacao' | 'servico' | 'outros';
  paymentType: string;
  description: string;
  value: number;
  isNegative?: boolean;
  date?: ISODate;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  category, paymentType, description, value, isNegative = true, onPress,
}) => {
  const iconColor = '#9ca3af';
  const Icon =
    category === 'transporte'
      ? Car
      : category === 'alimentacao'
      ? Utensils
      : category === 'servico'
      ? CreditCard
      : DollarSign;

  const formattedValue = `${isNegative ? '-' : ''}R$ ${value
    .toFixed(2)
    .replace('.', ',')}`;

  return (
    <TouchableOpacity
      activeOpacity={0.7} // opacidade ao tocar
      onPress={onPress}
      className="rounded-lg mb-2"
    >
      <View className="flex-row items-center justify-between py-3 bg-white rounded-lg px-3 border border-gray-300">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="p-2 rounded-full bg-gray-800/20">
            <Icon size={22} color={iconColor} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold">{paymentType}</Text>
            <Text className="text-gray-500 text-xs" numberOfLines={1}>
              {description}
            </Text>
          </View>
        </View>

        <Text
          className={`text-sm font-semibold ${
            isNegative ? 'text-red-400' : 'text-green-500'
          }`}
        >
          {formattedValue}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
