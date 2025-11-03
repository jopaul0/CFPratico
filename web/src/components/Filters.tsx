// src/components/Filters.tsx
// Traduzido de
// <ScrollView horizontal> vira <div className="flex overflow-x-auto">

import React from 'react';
import { X } from 'lucide-react';

// (Assumindo que os componentes traduzidos estão importados)
import { InputGroup } from './InputGroup';
import { DatePickerInput } from './DatePickerInput';

// (Mock para os tipos, já que não temos os hooks)
type FilterConfig = any;
interface FiltersProps {
  filters: FilterConfig[];
  className?: string;
  onClearFilters?: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  filters,
  className,
  onClearFilters,
}) => {
  // O hook useWindowDimensions é substituído por classes responsivas (flex-wrap)
  return (
    <div
      className={[
        'mt-3 flex flex-row flex-wrap items-end gap-3',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {filters.map((f: any) => (
        <div key={f.key} className="flex-shrink-0" style={{ width: f.width ?? 150 }}>
          {f.type === 'picker' ? (
            <InputGroup
              label={f.label}
              isSelect
              options={f.options}
              currentValue={f.selectedValue}
            />
          ) : (
            <DatePickerInput
              label={f.label}
              value={f.value}
              onChange={() => {}}
            />
          )}
        </div>
      ))}

      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 h-11 w-11 mb-3"
          aria-label="Limpar filtros"
          type="button"
        >
          <X size={24} color="#4b5563" />
        </button>
      )}
    </div>
  );
};