import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Search as SearchIcon, X } from 'lucide-react-native';

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

  return (
    <View className={['w-full bg-white border border-gray-300 rounded-2xl px-3 py-2 flex-row items-center', className].filter(Boolean).join(' ')}>
      <SearchIcon size={18} color="#6b7280" />
      <TextInput
        className="flex-1 text-base text-gray-900 px-2 focus:outline-none"
        style={{ minHeight: 44 }}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        returnKeyType="search"
        onSubmitEditing={onSubmitSearch}
      />
      {value?.length > 0 && (
        <Pressable onPress={handleClear} accessibilityRole="button" accessibilityLabel="Limpar busca" hitSlop={10}>
          <X size={18} color="#6b7280" />
        </Pressable>
      )}
    </View>
  );
};
