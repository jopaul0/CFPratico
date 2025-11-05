import React from 'react';
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
}> = ({ item, maxValue, colorClass }) => {
  const Icon = getCategoryIcon(item.iconName);
  const percentage = maxValue > 0 ? (item.total / maxValue) * 100 : 0;
  const formattedValue = formatToBRL(item.total);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1 px-1">
        <div className="flex items-center gap-2 flex-1 overflow-hidden">
            <Icon size={14} className="text-gray-500 shrink-0" />
            <span className="text-sm font-medium text-gray-700 truncate">
                {item.name}
            </span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{formattedValue}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${colorClass} h-2.5 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const CategoryChart: React.FC<CategoryChartProps> = ({ title, data, colorClass }) => {
  if (data.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow mt-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500">Nenhum dado encontrado para este período.</p>
      </div>
    );
  }

  const maxValue = data[0]?.total ?? 0;

  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4">
      <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
      {data.map((item) => (
        <ChartRow
          key={item.name}
          item={item}
          maxValue={maxValue}
          colorClass={colorClass}
        />
      ))}
    </div>
  );
};