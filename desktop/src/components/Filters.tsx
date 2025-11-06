import React from 'react';
import { X } from 'lucide-react';
import { InputGroup } from './InputGroup';
import { DatePickerInput } from './DatePickerInput';
import { FiltersProps } from '../types/Filters';

export const Filters: React.FC<FiltersProps> = ({ filters, className, onClearFilters }) => {
  
  const nodes = filters.map((f) => {
    let inputNode;
    
    if (f.type === 'picker') {
        inputNode = (
            <InputGroup
                label={f.label}
                isSelect
                options={f.options}
                currentValue={f.selectedValue}
                onValueChange={f.onValueChange}
            />
        );
    } else if (f.type === 'date') {
        inputNode = (
            <DatePickerInput
                label={f.label}
                value={f.value}
                onChange={f.onChange}
            />
        );
    } else {
        return null;
    }

    return (
        <div key={f.key} style={{ width: f.width ?? 240 }} className="shrink-0">
            {inputNode}
        </div>
    );
  });

  return (
    <div className={`mt-3 flex flex-row items-end gap-3 ${className}`}>        
        <div className="flex-1 flex flex-row flex-nowrap items-end gap-3 overflow-x-auto">
            {nodes}
        </div>

        {onClearFilters && (
            <button
                onClick={onClearFilters}
                className="flex items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300 h-11 w-11 my-auto shrink-0"
                aria-label="Limpar filtros"
            >
                <X size={24} className="text-gray-600" />
            </button>
        )}
    </div>
  );
};