// src/components/Filters.tsx
import React from 'react';
import { X } from 'lucide-react';
import { InputGroup } from './InputGroup';
import { DatePickerInput } from './DatePickerInput';
import { FilterPicker, FilterDate, FiltersProps } from '../types/Filters';

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
            {/* Adicionado 'shrink-0' para garantir que os itens não encolham */}
            {inputNode}
        </div>
    );
  });

  return (
    // --- LÓGICA ATUALIZADA AQUI ---
    // Container principal que alinha a lista de filtros e o botão de limpar
    <div className={`mt-3 flex flex-row items-end gap-3 ${className}`}>
        
        {/* 1. O container que rola horizontalmente */}
        <div className="flex-1 flex flex-row flex-nowrap items-end gap-3 overflow-x-auto">
            {nodes}
        </div>

        {/* 2. O botão de limpar, que fica estático no final */}
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