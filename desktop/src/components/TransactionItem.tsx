import React from 'react';
import { formatToBRL } from '../utils/Value';
import { Circle, CheckCircle } from 'lucide-react';
import { getCategoryIcon } from '../utils/CategoryIcons';
import { Link } from 'react-router-dom';

interface TransactionItemProps {
  id: string;
  category: string;
  categoryIcon: string;
  description: string;
  value: number;
  isNegative?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  id, category, categoryIcon, description, value, isNegative = true, onPress,
  onLongPress, isSelected = false, isSelectionMode = false,
}) => {
  const iconColor = '#9ca3af';
  const formattedValue = formatToBRL(value);
  const Icon = getCategoryIcon(categoryIcon);

  const selectionClass = isSelected ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-300';

  const content = (
    <div className={`flex items-center justify-between py-3 px-3 rounded-lg border transition-colors ${selectionClass}`}>
      {isSelectionMode && (
        <div className="mr-3">
          {isSelected ? (
            <CheckCircle size={22} className="text-blue-600" />
          ) : (
            <Circle size={22} className="text-gray-400" />
          )}
        </div>
      )}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-full bg-gray-200">
          <Icon size={22} color={iconColor} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-gray-900 font-semibold truncate">{category}</p>
          <p className="text-gray-500 text-xs truncate">
            {description}
          </p>
        </div>
      </div>
      <p className={`text-sm font-semibold whitespace-nowrap flex-shrink-0 ${isNegative ? 'text-red-500' : 'text-green-600'}`}>
        {formattedValue}
      </p>
    </div>
  );

  return isSelectionMode ? (
    <button
      onClick={onPress}
      onContextMenu={(e) => { e.preventDefault(); onLongPress?.(); }}
      className="w-full text-left rounded-lg mb-2"
    >
      {content}
    </button>
  ) : (
    <Link
      to={`/statement/${id}`}
      onContextMenu={(e) => { e.preventDefault(); onLongPress?.(); }}
      className="rounded-lg mb-2 block"
    >
      {content}
    </Link>
  );
};