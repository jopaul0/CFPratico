export type Option = { label: string; value: string };

export type FilterPicker = {
  key: string;
  label: string;
  type: 'picker'; 
  options: Option[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  width?: number;
};

export type FilterDate = {
    key: string;
    label: string;
    type: 'date'; 
    value: string;
    onChange: (dateString: string) => void;
    width?: number;
}

export type FilterConfig = FilterPicker | FilterDate;

export interface FiltersProps {
  filters: FilterConfig[];
  className?: string;
  onClearFilters?: () => void;
}