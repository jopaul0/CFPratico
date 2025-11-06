import { useState, useCallback, useEffect } from 'react';
import * as DB from '../services/database';
import type { Category } from '../services/database';
import { useRefresh } from '../contexts/RefreshContext';

export const useManageCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Estado do formulário
  const [formName, setFormName] = useState('');
  const [formIcon, setFormIcon] = useState('DollarSign'); // Ícone padrão
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { triggerReload } = useRefresh();

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await DB.fetchCategories();
      setCategories(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Preenche o formulário para edição
  const handleSelectCategory = useCallback((category: Category) => {
    setSelectedCategory(category);
    setFormName(category.name);
    setFormIcon(category.icon_name);
  }, []);

  // Limpa o formulário para adição
  const handleClearForm = useCallback(() => {
    setSelectedCategory(null);
    setFormName('');
    setFormIcon('DollarSign');
  }, []);

  // Salva (cria ou atualiza)
  const handleSave = useCallback(async () => {
    if (!formName) {
      throw new Error('O nome da categoria é obrigatório.');
    }
    setIsSaving(true);
    try {
      if (selectedCategory) {
        // Atualiza
        await DB.updateCategory(selectedCategory.id, formName, formIcon);
      } else {
        // Cria
        await DB.addCategory(formName, formIcon);
      }
      handleClearForm();
      await loadCategories();
      triggerReload();
    } finally {
      setIsSaving(false);
    }
  }, [selectedCategory, formName, formIcon, loadCategories, handleClearForm, triggerReload]);

  // Deleta
  const handleDelete = useCallback(async (id: number) => {
    if (!id) return;
    // (A tela vai chamar este)
    try {
      await DB.deleteCategory(id);
      handleClearForm();
      await loadCategories(); // Recarrega a lista local
      triggerReload(); // <-- DISPARA O GATILHO GLOBAL
    } catch (e) {
      console.error("Erro no hook handleDelete:", e);
      throw e; // Lança o erro para a tela tratar
    }
  }, [loadCategories, handleClearForm, triggerReload]);

  return {
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
    reload: loadCategories,
  };
};