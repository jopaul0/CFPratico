import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatToBRL } from '../utils/Value';
import { Circle, CheckCircle } from 'lucide-react-native';
import { getCategoryIcon } from '../utils/CategoryIcons';

interface TransactionItemProps {
  id: string;
  category: string;
  categoryIcon: string;
  paymentType: string;
  description: string;
  value: number;
  isNegative?: boolean;
  date?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  category, categoryIcon, paymentType, description, value, isNegative = true, onPress,
  onLongPress,
  isSelected = false,
  isSelectionMode = false,
}) => {
  const iconColor = '#9ca3af';
  const formattedValue = formatToBRL(value);
  const Icon = getCategoryIcon(categoryIcon);

  const selectionClass = isSelected
    ? 'bg-blue-100 border-blue-400'
    : 'bg-white border-gray-300';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={isSelectionMode ? onPress : onLongPress}
      className="rounded-lg mb-2"
    >
      <View className={`flex-row items-center justify-between py-3 px-3 rounded-lg border ${selectionClass}`}>
        {isSelectionMode && (
          <View className="mr-3">
            {isSelected ? (
              <CheckCircle size={22} color="#2563eb" />
            ) : (
              <Circle size={22} color="#9ca3af" />
            )}
          </View>
        )}
        <View className="flex-row items-center gap-3 flex-1">
          <View className="p-2 rounded-full bg-gray-800/20">
            <Icon size={22} color={iconColor} />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold">{category}</Text>
            <Text className="text-gray-500 text-xs" numberOfLines={1}>
              {description}
            </Text>
          </View>
        </View>
        <Text
          className={`text-sm font-semibold ${isNegative ? 'text-red-400' : 'text-green-500'
            }`}
        >
          {formattedValue}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
