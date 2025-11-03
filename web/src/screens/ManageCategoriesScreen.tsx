// src/screens/ManageCategoriesScreen.tsx
// Traduzido de
// <FlatList> vira <div> com .map()

import React from 'react';
import { MainContainer } from '../components/MainContainer';
import { InputGroup } from '../components/InputGroup';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { Trash, Edit, DollarSign } from 'lucide-react';

// --- MOCK DATA ---
const MOCK_CATEGORIES = [
  { id: 1, name: 'Venda', icon_name: 'Receipt' },
  { id: 2, name: 'Fornecedor', icon_name: 'Truck' },
  { id: 3, name: 'Aluguel', icon_name: 'LandPlot' },
];
// --- FIM MOCK DATA ---

const CategoryItem: React.FC<{ item: any; isSelected: boolean }> = ({
  item,
  isSelected,
}) => {
  const Icon = DollarSign; // Placeholder
  const selectionClass = isSelected ? 'bg-blue-100' : 'bg-white';

  return (
    <div
      className={`p-3 border border-gray-200 rounded-lg mb-2 ${selectionClass}`}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-3 flex-1 overflow-hidden">
          <Icon size={20} color="#4b5563" />
          <span className="text-base text-gray-800 truncate">{item.name}</span>
        </div>
        <div className="flex flex-row gap-3">
          <button className="p-1">
            <Edit size={18} color="#3b82f6" />
          </button>
          <button className="p-1">
            <Trash size={18} color="#ef4444" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ManageCategoriesScreen: React.FC = () => {
  const isSaving = false;
  const selectedCategory = null;

  return (
    <MainContainer>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Gerenciar Categorias
      </h1>

      <div className="p-4 bg-white rounded-lg shadow mb-6">
        <p className="text-lg font-semibold text-gray-700 mb-3">
          {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
        </p>
        <InputGroup
          label="Nome da Categoria"
          placeholder="Ex: Combustível"
          value={""}
        />
        <InputGroup
          label="Ícone"
          isSelect
          options={[{ label: 'Dinheiro / Padrão', value: 'DollarSign' }]}
          currentValue={'DollarSign'}
        />
        <div className="flex flex-row justify-end gap-3 mt-2">
          {selectedCategory && (
            <SimpleButton
              title="Excluir"
              className="bg-red-50 text-red-600 hover:bg-red-100"
              disabled={isSaving}
            />
          )}
          <SimpleButton title="Limpar" disabled={isSaving} />
          <SimpleButton
            title={isSaving ? 'Salvando...' : 'Adicionar'}
            className="bg-blue-600 text-white hover:bg-blue-700"
            disabled={isSaving}
          />
        </div>
      </div>

      <Divider />

      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Categorias Existentes
      </h2>

      <div>
        {MOCK_CATEGORIES.map((item) => (
          <CategoryItem
            key={item.id.toString()}
            item={item}
            isSelected={false}
          />
        ))}
      </div>
    </MainContainer>
  );
};