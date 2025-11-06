import React, { memo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { AggregatedDataByDate } from '../../hooks/useDashboardData';

interface TimeChartProps {
  title: string;
  data: AggregatedDataByDate[];
}

const formatDateLabel = (isoDate: string): string => {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
    }
    return isoDate;
};

const ChartDayBar: React.FC<{
  item: AggregatedDataByDate;
  maxChartHeight: number;
}> = memo(({ item, maxChartHeight }) => {
  
  const CHART_HEIGHT_PX = 120;
  const BAR_WIDTH = 12;

  const revenueHeightPercent = maxChartHeight > 0 ? (item.totalRevenue / maxChartHeight) * 100 : 0;
  const expenseHeightPercent = maxChartHeight > 0 ? (item.totalExpense / maxChartHeight) * 100 : 0;

  return (
    <View className="items-center px-2">
      <View 
        className="flex-row justify-center items-end" 
        style={{ height: CHART_HEIGHT_PX, width: BAR_WIDTH * 2 + 4 }}
      >
        <View 
          className="bg-green-500 rounded-t-sm"
          style={{ width: BAR_WIDTH, height: `${revenueHeightPercent}%` }} 
        />
        <View 
          className="bg-red-500 rounded-t-sm ml-1"
          style={{ width: BAR_WIDTH, height: `${expenseHeightPercent}%` }} 
        />
      </View>
      <Text className="text-xs text-gray-600 mt-1">{formatDateLabel(item.date)}</Text>
    </View>
  );
});

export const TimeChart: React.FC<TimeChartProps> = memo(({ title, data }) => {
  if (data.length === 0) {
    return (
      <View className="p-4 bg-white rounded-lg shadow mt-4">
        <Text className="text-lg font-bold text-gray-800 mb-2">{title}</Text>
        <Text className="text-gray-500">Nenhum dado encontrado para este período.</Text>
      </View>
    );
  }

  const maxValue = data.reduce((max, item) => {
      return Math.max(max, item.totalRevenue, item.totalExpense);
  }, 0);

  return (
    <View className="p-4 bg-white rounded-lg shadow mt-4">
      <Text className="text-lg font-bold text-gray-800 mb-4">{title}</Text>
      <View className="flex-row items-center mb-2">
          <View className="w-3 h-3 bg-green-500 rounded-sm mr-1" />
          <Text className="text-xs text-gray-600 mr-4">Receitas</Text>
          <View className="w-3 h-3 bg-red-500 rounded-sm mr-1" />
          <Text className="text-xs text-gray-600">Despesas</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row pt-2 pb-1">
            {data.map((item) => (
              <ChartDayBar
                key={item.date}
                item={item}
                maxChartHeight={maxValue}
              />
            ))}
          </View>
      </ScrollView>
    </View>
  );
});