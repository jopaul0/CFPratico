// src/components/SearchBar.tsx
// Traduzido de
// <View> -> <div>, <TextInput> -> <input>, <Pressable> -> <button>
// Importamos o ícone de 'lucide-react'

import React from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  // ... (props podem ser adicionadas depois)
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  placeholder = 'Buscar...',
  className,
}) => {
  return (
    <div
      className={[
        'w-full bg-white border border-gray-300 rounded-2xl px-3 py-2 flex-row items-center gap-2',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ minHeight: 44 }}
    >
      <SearchIcon size={18} color="#6b7280" />
      <input
        type="text"
        className="flex-1 text-base text-gray-900 focus:outline-none bg-transparent"
        placeholder={placeholder}
        value={value}
      />
      {value?.length > 0 && (
        <button
          type="button"
          aria-label="Limpar busca"
          className="p-1"
        >
          <X size={18} color="#6b7280" />
        </button>
      )}
    </div>
  );
};