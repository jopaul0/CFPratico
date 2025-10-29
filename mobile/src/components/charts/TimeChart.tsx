// src/components/charts/TimeChart.tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { AggregatedDataByDate } from '../../hooks/useDashboardData';

interface TimeChartProps {
  title: string;
  data: AggregatedDataByDate[];
}

// Formata a data 'YYYY-MM-DD' para 'DD/MM'
const formatDateLabel = (isoDate: string): string => {
    const parts = isoDate.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
    }
    return isoDate;
};

// Componente para uma única barra diária (duas barras: receita e despesa)
const ChartDayBar: React.FC<{
  item: AggregatedDataByDate;
  maxChartHeight: number; // O valor R$ máximo (para normalizar)
}> = ({ item, maxChartHeight }) => {
  
  const CHART_HEIGHT_PX = 120; // Altura máxima do container do gráfico (em pixels)
  const BAR_WIDTH = 12; // Largura de cada barra

  // Calcula a altura percentual
  const revenueHeightPercent = maxChartHeight > 0 ? (item.totalRevenue / maxChartHeight) * 100 : 0;
  const expenseHeightPercent = maxChartHeight > 0 ? (item.totalExpense / maxChartHeight) * 100 : 0;

  return (
    <View className="items-center px-2">
      {/* Container das Barras (para alinhar na base) */}
      <View 
        className="flex-row justify-center items-end" 
        style={{ height: CHART_HEIGHT_PX, width: BAR_WIDTH * 2 + 4 }}
      >
        {/* Barra de Receita */}
        <View 
          className="bg-green-500 rounded-t-sm"
          style={{ width: BAR_WIDTH, height: `${revenueHeightPercent}%` }} 
        />
        {/* Barra de Despesa */}
        <View 
          className="bg-red-500 rounded-t-sm ml-1"
          style={{ width: BAR_WIDTH, height: `${expenseHeightPercent}%` }} 
        />
      </View>
      {/* Rótulo da Data */}
      <Text className="text-xs text-gray-600 mt-1">{formatDateLabel(item.date)}</Text>
    </View>
  );
};

// Componente principal do gráfico
export const TimeChart: React.FC<TimeChartProps> = ({ title, data }) => {
  if (data.length === 0) {
    return (
      <View className="p-4 bg-white rounded-lg shadow mt-4">
        <Text className="text-lg font-bold text-gray-800 mb-2">{title}</Text>
        <Text className="text-gray-500">Nenhum dado encontrado para este período.</Text>
      </View>
    );
  }

  // Encontra o valor máximo (receita ou despesa) em todo o período
  // Isso é usado para normalizar a altura de todas as barras
  const maxValue = data.reduce((max, item) => {
      return Math.max(max, item.totalRevenue, item.totalExpense);
  }, 0);

  return (
    <View className="p-4 bg-white rounded-lg shadow mt-4">
      {/* Título e Legenda */}
      <Text className="text-lg font-bold text-gray-800 mb-4">{title}</Text>
      <View className="flex-row items-center mb-2">
          <View className="w-3 h-3 bg-green-500 rounded-sm mr-1" />
          <Text className="text-xs text-gray-600 mr-4">Receitas</Text>
          <View className="w-3 h-3 bg-red-500 rounded-sm mr-1" />
          <Text className="text-xs text-gray-600">Despesas</Text>
      </View>

      {/* Gráfico com Scroll */}
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
};