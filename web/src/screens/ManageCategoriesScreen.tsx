// src/screens/ManageCategoriesScreen.tsx
import React from 'react';
import { MainContainer } from '../components/MainContainer';
import { InputGroup } from '../components/InputGroup';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { useManageCategories } from '../hooks/useManageCategories';
import { Category } from '../types/Database';
import { iconMap, getCategoryIcon, ICON_TRANSLATIONS } from '../utils/CategoryIcons';
import { Option } from '../types/Filters';
import { Trash, Edit } from 'lucide-react';

const iconOptions: Option[] = Object.keys(iconMap)
  .sort((a, b) => (ICON_TRANSLATIONS[a] || a).localeCompare(ICON_TRANSLATIONS[b] || b))
  .map(iconName => ({
    label: ICON_TRANSLATIONS[iconName] || iconName,
    value: iconName,
  }));

// Componente de Item (traduzido para web)
const CategoryItem: React.FC<{
  item: Category;
  onSelect: (item: Category) => void;
  onDelete: (item: Category) => void;
  isSelected: boolean;
}> = ({ item, onSelect, onDelete, isSelected }) => {
  const Icon = getCategoryIcon(item.icon_name);
  const selectionClass = isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white';

  return (
    <div className={`p-3 border border-gray-200 rounded-lg mb-2 shadow-sm ${selectionClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <Icon size={20} className="text-gray-600 shrink-0" />
          <span className="text-base text-gray-800 truncate">{item.name}</span>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => onSelect(item)} className="p-1 hover:cursor-pointer">
            <Edit size={18} className="text-blue-600 hover:text-blue-800" />
          </button>
          <button onClick={() => onDelete(item)} className="p-1 hover:cursor-pointer">
            <Trash size={18} className="text-red-600 hover:text-red-800" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Tela Principal
export const ManageCategoriesScreen: React.FC = () => {
  const {
    categories,
    isLoading,
    isSaving,
    error,
    formName,
    setFormName,
    formIcon,
    setFormIcon,
    selectedCategory,
    handleSelectCategory,
    handleClearForm,
    handleSave,
    handleDelete,
  } = useManageCategories();

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSave();
    } catch (e: any) {
      alert(`Erro: ${e.message}`);
    }
  };

  const onDelete = (item: Category) => {
    if (window.confirm(`Tem certeza que deseja excluir "${item.name}"? As transações associadas não serão excluídas, mas ficarão sem categoria.`)) {
      handleDelete(item.id).catch(e => alert(`Erro ao excluir: ${e.message}`));
    }
  };

  const onDeleteFromForm = () => {
    if (selectedCategory) {
      onDelete(selectedCategory);
    }
  }

  const renderList = () => {
    if (isLoading) {
      return <div className="text-center my-4">Carregando...</div>;
    }
    if (error) {
      return <p className="text-red-500 text-center my-4">Erro ao carregar: {error.message}</p>;
    }
    if (categories.length === 0) {
      return <p className="text-gray-500 text-center my-4">Nenhuma categoria encontrada.</p>;
    }

    return (
      <div>
        {categories.map((item) => (
          <CategoryItem
            key={item.id.toString()}
            item={item}
            onSelect={handleSelectCategory}
            onDelete={onDelete}
            isSelected={selectedCategory?.id === item.id}
          />
        ))}
      </div>
    );
  };

  return (
    <MainContainer title="Gerenciar Categorias" showBackButton>
      {/* Formulário de Edição/Criação */}
      <form onSubmit={onSave} className="p-4 bg-white rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">
          {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
        </h2>
        <InputGroup
          label="Nome da Categoria"
          placeholder="Ex: Combustível"
          value={formName}
          onChangeText={setFormName}
        />
        <InputGroup
          label="Ícone"
          isSelect
          options={iconOptions}
          currentValue={formIcon}
          onValueChange={setFormIcon}
        />
        <div className="flex flex-wrap justify-end gap-3 mt-2">
          {selectedCategory && (
            <SimpleButton
              title="Excluir"
              type="button"
              onPress={onDeleteFromForm}
              disabled={isSaving}
              className="bg-red-100 text-red-700 hover:bg-red-200"
            />
          )}
          <SimpleButton
            title="Limpar"
            type="button"
            onPress={handleClearForm}
            disabled={isSaving}
          />
          <SimpleButton
            title={isSaving ? 'Salvando...' : (selectedCategory ? 'Salvar' : 'Adicionar')}
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white hover:bg-blue-700"
          />
        </div>
      </form>

      <Divider />

      {/* Lista de Categorias */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">Categorias Existentes</h2>
      {renderList()}
    </MainContainer>
  );
};