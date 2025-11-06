import React from 'react';
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
}> = ({ item, maxChartHeight }) => {
  
  const CHART_HEIGHT_PX = 120;
  const BAR_WIDTH = 12;

  const revenueHeightPercent = maxChartHeight > 0 ? (item.totalRevenue / maxChartHeight) * 100 : 0;
  const expenseHeightPercent = maxChartHeight > 0 ? (item.totalExpense / maxChartHeight) * 100 : 0;

  return (
    <div className="flex flex-col items-center px-2">
      <div 
        className="flex items-end justify-center" 
        style={{ height: CHART_HEIGHT_PX, width: BAR_WIDTH * 2 + 4 }}
      >
        <div 
          className="bg-green-500 rounded-t-sm"
          style={{ width: BAR_WIDTH, height: `${revenueHeightPercent}%` }} 
        />
        <div 
          className="bg-red-500 rounded-t-sm ml-1"
          style={{ width: BAR_WIDTH, height: `${expenseHeightPercent}%` }} 
        />
      </div>
      <span className="text-xs text-gray-600 mt-1">{formatDateLabel(item.date)}</span>
    </div>
  );
};

export const TimeChart: React.FC<TimeChartProps> = ({ title, data }) => {
  if (data.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow mt-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500">Nenhum dado encontrado para este período.</p>
      </div>
    );
  }

  const maxValue = data.reduce((max, item) => {
      return Math.max(max, item.totalRevenue, item.totalExpense);
  }, 0);

  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <div className="flex items-center mb-2">
          <div className="w-3 h-3 bg-green-500 rounded-sm mr-1" />
          <span className="text-xs text-gray-600 mr-4">Receitas</span>
          <div className="w-3 h-3 bg-red-500 rounded-sm mr-1" />
          <span className="text-xs text-gray-600">Despesas</span>
      </div>

      <div className="overflow-x-auto">
          <div className="flex pt-2 pb-1">
            {data.map((item) => (
              <ChartDayBar
                key={item.date}
                item={item}
                maxChartHeight={maxValue}
              />
            ))}
          </div>
      </div>
    </div>
  );
};