import React from 'react';
import { View, Text } from 'react-native';
import { Car, Utensils, CreditCard, DollarSign } from 'lucide-react-native';

interface TransactionItemProps {
  category: 'transporte' | 'alimentacao' | 'servico' | 'outros';
  paymentType: string;
  description: string;
  value: number;
  isNegative?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  category,
  paymentType,
  description,
  value,
  isNegative = true,
}) => {
  const iconColor = '#9ca3af';

  const renderIcon = () => {
    switch (category) {
      case 'transporte':
        return <Car size={22} color={iconColor} />;
      case 'alimentacao':
        return <Utensils size={22} color={iconColor} />;
      case 'servico':
        return <CreditCard size={22} color={iconColor} />;
      default:
        return <DollarSign size={22} color={iconColor} />;
    }
  };

  const formattedValue = `${isNegative ? '-' : ''}R$ ${value.toFixed(2).replace('.', ',')}`;

  return (
    <View className="flex-row items-center justify-between py-3 bg-white rounded-lg border border-gray-300 px-3">
      <View className="flex-row items-center gap-3 flex-1">
        <View className="p-2 rounded-full bg-gray-800/20">
          {renderIcon()}
        </View>
        <View className="flex-1">
          <Text className="text-black-100 font-semibold">{paymentType}</Text>
          <Text className="text-gray-500 text-xs" numberOfLines={1}>
            {description}
          </Text>
        </View>
      </View>
      <Text className={`text-sm font-semibold ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
        {formattedValue}
      </Text>
    </View>
  );
};
