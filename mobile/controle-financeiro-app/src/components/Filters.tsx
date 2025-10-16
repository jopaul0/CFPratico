import React, { useMemo } from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { InputGroup } from './InputGroup';

export type Option = { label: string; value: string };

export type FilterConfig = {
  key: string;
  label: string;
  options: Option[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  width?: number;
};

export interface FiltersProps {
  filters: FilterConfig[];
  className?: string;
}

export const Filters: React.FC<FiltersProps> = ({ filters, className }) => {
  const { width } = useWindowDimensions();
  const isSmall = width < 640;

  const nodes = useMemo(
    () =>
      filters.map((f) => (
        <View
          key={f.key}
          className="mr-3 mb-3"
          style={{ width: isSmall ? Math.min(width * 0.7, 280) : f.width ?? 240 }}
        >
          <InputGroup
            label={f.label}
            isSelect
            options={f.options}
            currentValue={f.selectedValue}
            onValueChange={f.onValueChange}
          />
        </View>
      )),
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
