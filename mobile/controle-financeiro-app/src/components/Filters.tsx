import React, { useMemo } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';

import { InputGroup } from './InputGroup';
import { DatePickerInput } from './DatePickerInput';

// Importa os tipos centralizados
import { FilterConfig, FilterPicker, FilterDate, FiltersProps } from '../types/Filters';


export const Filters: React.FC<FiltersProps> = ({ filters, className }) => {
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

  return isSmall ? (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={['mt-3', className].filter(Boolean).join(' ')}
      contentContainerStyle={{ paddingRight: 8 }}
    >
      <View className="flex-row items-stretch">{nodes}</View>
    </ScrollView>
  ) : (
    <View className={['mt-3 flex-row flex-wrap items-stretch', className].filter(Boolean).join(' ')}>
      {nodes}
    </View>
  );
};