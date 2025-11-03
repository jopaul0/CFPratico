import React from 'react';

type AggregatedDataByDate = {
  date: string;
  totalRevenue: number;
  totalExpense: number;
};

interface TimeChartProps {
  title: string;
  data: AggregatedDataByDate[];
}

const formatDateLabel = (isoDate: string): string => {
  const parts = isoDate.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : isoDate;
};

const ChartDayBar: React.FC<{
  item: AggregatedDataByDate;
  maxChartHeight: number;
}> = ({ item, maxChartHeight }) => {
  const CHART_HEIGHT_PX = 120;
  const BAR_WIDTH = 12;

  const revenueHeightPercent =
    maxChartHeight > 0 ? (item.totalRevenue / maxChartHeight) * 100 : 0;
  const expenseHeightPercent =
    maxChartHeight > 0 ? (item.totalExpense / maxChartHeight) * 100 : 0;

  return (
    <div className="flex flex-col items-center px-2">
      <div
        className="flex flex-row justify-center items-end"
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
      <span className="text-xs text-gray-600 mt-1">
        {formatDateLabel(item.date)}
      </span>
    </div>
  );
};

export const TimeChart: React.FC<TimeChartProps> = ({ title, data }) => {
  if (data.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow mt-4">
        <p className="text-lg font-bold text-gray-800 mb-2">{title}</p>
        <p className="text-gray-500">Nenhum dado encontrado para este período.</p>
      </div>
    );
  }

  const maxValue = data.reduce(
    (max, item) => Math.max(max, item.totalRevenue, item.totalExpense),
    0,
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4">
      <p className="text-lg font-bold text-gray-800 mb-4">{title}</p>
      <div className="flex flex-row items-center mb-2">
        <div className="w-3 h-3 bg-green-500 rounded-sm mr-1" />
        <span className="text-xs text-gray-600 mr-4">Receitas</span>
        <div className="w-3 h-3 bg-red-500 rounded-sm mr-1" />
        <span className="text-xs text-gray-600">Despesas</span>
      </div>

      {/* Scroll Horizontal na Web */}
      <div className="overflow-x-auto">
        <div className="flex flex-row pt-2 pb-1">
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