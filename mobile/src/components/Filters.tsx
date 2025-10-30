// src/components/Filters.tsx
import React, { useMemo } from 'react';
import { 
    View, 
    ScrollView, 
    useWindowDimensions, 
    TouchableOpacity,
    Platform
} from 'react-native';
import { X } from 'lucide-react-native';

import { InputGroup } from './InputGroup';
import { DatePickerInput } from './DatePickerInput';

import { FilterPicker, FilterDate, FiltersProps } from '../types/Filters';


export const Filters: React.FC<FiltersProps> = ({ 
    filters, 
    className, 
    onClearFilters // <-- Pega a nova prop
}) => {
  const { width } = useWindowDimensions();
  const isSmall = width < 640;

  const nodes = useMemo(
    () =>
      filters.map((f) => {
        const itemWidth = isSmall ? Math.min(width * 0.7, 160) : f.width ?? 240;

        let inputNode;
        
        if (f.type === 'picker') {
            const pickerConfig = f as FilterPicker;
            inputNode = (
                <InputGroup
                    label={pickerConfig.label}
                    isSelect
                    options={pickerConfig.options}
                    currentValue={pickerConfig.selectedValue}
                    onValueChange={pickerConfig.onValueChange}
                />
            );
        } else if (f.type === 'date') {
            const dateConfig = f as FilterDate;
            inputNode = (
                <DatePickerInput
                    label={dateConfig.label}
                    value={dateConfig.value}
                    onChange={dateConfig.onChange}
                />
            );
        } else {
            return null;
        }

        return (
            <View
              key={f.key}
              className="mr-3 mb-3"
              style={{ width: itemWidth }}
            >
                {inputNode}
            </View>
        );
    }),
    [filters, isSmall, width]
  );


  const clearButtonNode = onClearFilters && (
      <View 
        className=" justify-center" 
        style={{ width: 30 }}
      >
          <TouchableOpacity
              onPress={onClearFilters}
              className="flex items-center justify-center rounded-lg bg-gray-200 active:bg-gray-300"
              style={{ height: 30}}
              accessibilityLabel="Limpar filtros"
          >
              <X size={24} color="#4b5563" />
          </TouchableOpacity>
      </View>
  );

  return isSmall ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={['mt-3', className].filter(Boolean).join(' ')}
      contentContainerStyle={{ paddingRight: 8 }}
    >
      <View className="flex-row items-stretch">
        {nodes}
        {clearButtonNode}
      </View>
    </ScrollView>
  ) : (
    <View className={['mt-3 flex-row flex-wrap items-stretch', className].filter(Boolean).join(' ')}>
      {nodes}
      {clearButtonNode}
    </View>
  );
};