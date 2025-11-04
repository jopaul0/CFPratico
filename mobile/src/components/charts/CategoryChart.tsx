import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { AggregatedData } from '../../hooks/useDashboardData';
import { formatToBRL } from '../../utils/Value';
import { getCategoryIcon } from '../../utils/CategoryIcons';

interface CategoryChartProps {
  title: string;
  data: AggregatedData[];
  colorClass: string;
}

const ChartRow: React.FC<{
  item: AggregatedData;
  maxValue: number;
  colorClass: string;
}> = memo(({ item, maxValue, colorClass }) => {
  const Icon = getCategoryIcon(item.iconName);
  const percentage = maxValue > 0 ? (item.total / maxValue) * 100 : 0;
  const formattedValue = formatToBRL(item.total);

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-1 px-1">
        <View className="flex-row items-center gap-2 flex-1">
            <Icon size={14} color="#6b7280" />
            <Text className="text-sm font-medium text-gray-700" numberOfLines={1}>
                {item.name}
            </Text>
        </View>
        <Text className="text-sm font-semibold text-gray-900">{formattedValue}</Text>
      </View>
      <View className="w-full bg-gray-200 rounded-full h-2.5">
        <View
          className={`${colorClass} h-2.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
});

export const CategoryChart: React.FC<CategoryChartProps> = memo(({ title, data, colorClass }) => {
  if (data.length === 0) {
    return (
      <View className="p-4 bg-white rounded-lg shadow mt-4">
        <Text className="text-lg font-bold text-gray-800 mb-2">{title}</Text>
        <Text className="text-gray-500">Nenhum dado encontrado para este período.</Text>
      </View>
    );
  }

  const maxValue = data[0].total;

  return (
    <View className="p-4 bg-white rounded-lg shadow mt-4">
      <Text className="text-lg font-bold text-gray-800 mb-4">{title}</Text>
      {data.map((item) => (
        <ChartRow
          key={item.name}
          item={item}
          maxValue={maxValue}
          colorClass={colorClass}
        />
      ))}
    </View>
  );
});