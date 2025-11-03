// src/components/TransactionItem.tsx
// Traduzido de
// <TouchableOpacity> -> <button> ou <Link> do react-router-dom
// <View> -> <div>, <Text> -> <p>/<span>

import React from 'react';
// (Vamos precisar do util de ícones)
// import { getCategoryIcon } from '../utils/CategoryIcons';
import { DollarSign, CheckCircle, Circle } from 'lucide-react';

interface TransactionItemProps {
  id: string;
  category: string;
  categoryIcon: string;
  description: string;
  value: string; // Apenas visual
  isNegative?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  category,
  categoryIcon,
  description,
  value,
  isNegative = true,
  isSelected = false,
  isSelectionMode = false,
}) => {
  const iconColor = '#9ca3af';
  // const Icon = getCategoryIcon(categoryIcon);
  const Icon = DollarSign; // Placeholder

  const selectionClass = isSelected
    ? 'bg-blue-100 border-blue-400'
    : 'bg-white border-gray-300';

  return (
    // No futuro, isso será um <Link to={`/transaction/${id}`}>
    <button
      type="button"
      className={`w-full rounded-lg mb-2 text-left ${selectionClass}`}
    >
      <div
        className={`flex-row items-center justify-between py-3 px-3 rounded-lg border`}
      >
        {isSelectionMode && (
          <div className="mr-3">
            {isSelected ? (
              <CheckCircle size={22} color="#2563eb" />
            ) : (
              <Circle size={22} color="#9ca3af" />
            )}
          </div>
        )}
        <div className="flex flex-row items-center gap-3 flex-1">
          <div className="p-2 rounded-full bg-gray-100">
            <Icon size={22} color={iconColor} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-gray-900 font-semibold truncate">
              {category}
            </p>
            <p className="text-gray-500 text-xs truncate">
              {description}
            </p>
          </div>
        </div>
        <span
          className={`text-sm font-semibold ml-2 ${
            isNegative ? 'text-red-500' : 'text-green-500'
          }`}
        >
          {value}
        </span>
      </div>
    </button>
  );
};