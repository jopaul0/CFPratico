import React from 'react';
import { View, Text, Alert, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';

import { MainContainer } from '../components/MainContainer';
import { InputGroup } from '../components/InputGroup';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { useManageCategories } from '../hooks/useManageCategories';
import { Category } from '../services/database';

// --- (CORREÇÃO 2: Importar ICON_TRANSLATIONS) ---
import { iconMap, getCategoryIcon, ICON_TRANSLATIONS } from '../utils/CategoryIcons';
import { Option } from '../types/Filters';
import { Trash, Edit } from 'lucide-react-native';

// --- (CORREÇÃO 2: Usar traduções no label) ---
// Gera a lista de opções para o Picker de ícones
const iconOptions: Option[] = Object.keys(iconMap)
  .sort((a, b) => (ICON_TRANSLATIONS[a] || a).localeCompare(ICON_TRANSLATIONS[b] || b)) // Ordena pelo nome traduzido
  .map(iconName => ({
    label: ICON_TRANSLATIONS[iconName] || iconName, // <-- Usa a tradução
    value: iconName, // <-- Mantém o valor original
  }));

// Componente de item da lista (Sem alterações)
const CategoryItem: React.FC<{
  item: Category;
  onSelect: (item: Category) => void;
  onDelete: (item: Category) => void;
  isSelected: boolean;
}> = ({ item, onSelect, onDelete, isSelected }) => {
  const Icon = getCategoryIcon(item.icon_name);
  const selectionClass = isSelected ? 'bg-blue-100' : 'bg-white';

  return (
    <View className={`p-3 border border-gray-200 rounded-lg mb-2 ${selectionClass}`}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <Icon size={20} color="#4b5563" />
          <Text className="text-base text-gray-800" numberOfLines={1}>{item.name}</Text>
        </View>
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={() => onSelect(item)} className="p-1">
            <Edit size={18} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(item)} className="p-1">
            <Trash size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    reload,
  } = useManageCategories();

  const onSave = async () => {
    try {
      await handleSave();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  const onDelete = (item: Category) => {
    Alert.alert(
      'Excluir Categoria',
      `Tem certeza que deseja excluir "${item.name}"? As transações associadas não serão excluídas, mas ficarão sem categoria.`, // Ajuste de texto
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await handleDelete(item.id);
            } catch (e: any) {
              Alert.alert('Erro ao excluir', e.message);
            }
          },
        },
      ]
    );
  };

  const onDeleteFromForm = () => {
    if (selectedCategory) {
      onDelete(selectedCategory);
    }
  }

  // --- (CORREÇÃO 1: Lógica do "ListEmptyComponent" movida para cá) ---
  const renderList = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" className="my-4" />;
    }
    if (error) {
      return <Text className="text-red-500 text-center my-4">Erro ao carregar: {error.message}</Text>;
    }
    if (categories.length === 0) {
      return <Text className="text-gray-500 text-center my-4">Nenhuma categoria encontrada.</Text>;
    }

    // --- (CORREÇÃO 1: Troca de FlatList para .map()) ---
    return (
      <View>
        {categories.map((item) => (
          <CategoryItem
            key={item.id.toString()}
            item={item}
            onSelect={handleSelectCategory}
            onDelete={onDelete}
            isSelected={selectedCategory?.id === item.id}
          />
        ))}
      </View>
    );
  };

  return (
    // MainContainer fornece a ScrollView, então o erro de nesting some
    <MainContainer
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={reload}
          colors={['#3b82f6']}
          tintColor={'#3b82f6'} // para iOS
        />
      }>
      <Text className="text-2xl font-bold text-gray-800 mb-4">Gerenciar Categorias</Text>

      {/* Formulário de Edição/Criação */}
      <View className="p-4 bg-white rounded-lg shadow mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
        </Text>
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
        <View className="flex-row justify-end gap-3 mt-2">
          {selectedCategory && (
            <SimpleButton
              title="Excluir"
              onPress={onDeleteFromForm}
              backgroundColor="#fef2f2"
              textColor="#ef4444"
              activeBackgroundColor="#fee2e2"
              disabled={isSaving}
            />
          )}
          <SimpleButton
            title="Limpar"
            onPress={handleClearForm}
            disabled={isSaving}
          />
          <SimpleButton
            title={isSaving ? 'Salvando...' : (selectedCategory ? 'Salvar' : 'Adicionar')}
            onPress={onSave}
            backgroundColor="#3b82f6"
            textColor="#ffffff"
            activeBackgroundColor="#2563eb"
            disabled={isSaving}
          />
        </View>
      </View>

      <Divider />

      {/* Lista de Categorias */}
      <Text className="text-xl font-bold text-gray-800 mb-4">Categorias Existentes</Text>

      {/* --- (CORREÇÃO 1: Chamada da função de renderização) --- */}
      {renderList()}

    </MainContainer>
  );
};