import { db } from '../db';
import { Category } from '../../../types/Database';

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    return await db.categories.orderBy('name').toArray();
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

export const addCategory = async (name: string, iconName: string): Promise<Category> => {
  try {
    const newId = await db.categories.add({
      name: name,
      icon_name: iconName
    } as any);
    
    return { id: newId as number, name, icon_name: iconName };
  } catch (error: any) {
    console.error(`Erro ao adicionar categoria '${name}':`, error);
    if (error.name === 'ConstraintError') {
      throw new Error('Essa categoria já existe.');
    }
    throw error;
  }
};

export const updateCategory = async (id: number, name: string, iconName: string): Promise<void> => {
  try {
    const count = await db.categories.update(id, { name: name, icon_name: iconName });
    if (count === 0) {
      throw new Error("Categoria não encontrada para atualizar.");
    }
  } catch (error: any) {
    console.error(`Erro ao atualizar categoria ${id}:`, error);
    if (error.name === 'ConstraintError') {
      throw new Error('Esse nome de categoria já está em uso.');
    }
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await db.transaction('rw', db.categories, db.transactions, async () => {
      await db.transactions
        .where({ category_id: id })
        .modify({ category_id: null as any });
      await db.categories.delete(id);
    });
    
    console.log(`Categoria ${id} deletada (e transações associadas atualizadas).`);
  } catch (error: any) {
    console.error(`Erro ao deletar categoria ${id}:`, error);
    throw error;
  }
};