// src/components/SummaryCard.tsx
// Traduzido de
// <View> vira <div>, <Text> vira <p> ou <span>

import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string; // Na web, é mais fácil passar a string formatada
  valueColorClass: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  valueColorClass,
}) => {
  return (
    // No RN era w-full sm:w-1/3. No Tailwind web, usamos col-span
    <div className="w-full p-2">
      <div className="bg-white rounded-xl shadow-md p-5">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <p className={`text-3xl font-bold mt-2 ${valueColorClass}`}>
          {value}
        </p>
      </div>
    </div>
  );
};