import React from 'react';

interface SummaryCardProps {
  title: string;
  value: number;
  valueColorClass: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, valueColorClass }) => {
  const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="w-full p-2 lg:w-1/3">
      <div className="bg-white rounded-xl shadow-md p-5">
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </h3>
        <p className={`text-3xl font-bold mt-2 ${valueColorClass}`}>
          {formattedValue}
        </p>
      </div>
    </div>
  );
};