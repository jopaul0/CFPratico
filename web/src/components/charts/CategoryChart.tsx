import React from 'react';
import { DollarSign } from 'lucide-react';

type AggregatedData = { name: string; total: number; iconName: string };

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
  const Icon = DollarSign; // Placeholder
  const percentage = maxValue > 0 ? (item.total / maxValue) * 100 : 0;
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(item.total);

  return (
    <div className="mb-4">
      <div className="flex flex-row justify-between items-center mb-1 px-1">
        <div className="flex flex-row items-center gap-2 flex-1 overflow-hidden">
          <Icon size={14} color="#6b7280" />
          <span className="text-sm font-medium text-gray-700 truncate">
            {item.name}
          </span>
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {formattedValue}
        </span>
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

export const CategoryChart: React.FC<CategoryChartProps> = ({
  title,
  data,
  colorClass,
}) => {
  if (data.length === 0) {
    return (
      <div className="p-4 bg-white rounded-lg shadow mt-4">
        <p className="text-lg font-bold text-gray-800 mb-2">{title}</p>
        <p className="text-gray-500">Nenhum dado encontrado para este período.</p>
      </div>
    );
  }

  const maxValue = data[0]?.total || 0;

  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4">
      <p className="text-lg font-bold text-gray-800 mb-4">{title}</p>
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