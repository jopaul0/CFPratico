// src/types/Filters.ts

export type Option = { label: string; value: string };

// Tipos para os filtros baseados em Picker
export type FilterPicker = {
  key: string;
  label: string;
  type: 'picker'; 
  options: Option[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  width?: number;
};

// Tipos para os filtros de Data
export type FilterDate = {
    key: string;
    label: string;
    type: 'date'; 
    value: string;
    onChange: (dateString: string) => void;
    width?: number;
}

// Tipo de união para as configurações de filtro
export type FilterConfig = FilterPicker | FilterDate;

export interface FiltersProps {
  filters: FilterConfig[];
  className?: string;
  onClearFilters?: () => void;
}