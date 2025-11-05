import React from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmitSearch?: () => void;
  onClearAll?: () => void;
  disabled?: boolean;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Buscar...',
  onSubmitSearch,
  onClearAll,
  disabled = false,
  className,
}) => {
  const handleClear = () => {
    if (onClearAll) return onClearAll();
    onChangeText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmitSearch?.();
    }
  };

  return (
    <div className={`w-full bg-white border border-gray-300 rounded-lg px-3 py-1 flex items-center ${className}`}>
      <SearchIcon size={18} className="text-gray-500" />
      <input
        className="flex-1 text-base text-gray-900 px-2 h-10 bg-transparent focus:outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        disabled={disabled}
        onKeyDown={handleKeyDown}
      />
      {value?.length > 0 && (
        <button onClick={handleClear} aria-label="Limpar busca" className="p-1">
          <X size={18} className="text-gray-500" />
        </button>
      )}
    </div>
  );
};