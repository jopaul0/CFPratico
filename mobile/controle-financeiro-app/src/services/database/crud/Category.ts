// src/services/database/categoryRepository.ts
import { dbPromise } from '../connection';
import { Category } from '../../../types/Database';

/**
 * Busca todas as categorias.
 */
export const fetchCategories = async (): Promise<Category[]> => {
  const db = await dbPromise;
  try {
    // Usamos getAllAsync<T> para tipar o retorno
    const results = await db.getAllAsync<Category>(
      'SELECT * FROM category ORDER BY name ASC;'
    );
    return results;
  } catch (error : any) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

/**
 * Adiciona uma nova categoria.
 * Retorna o objeto da nova categoria com o ID.
 */
export const addCategory = async (name: string): Promise<Category> => {
  // ... (código existente, da resposta anterior)
  const db = await dbPromise;
  try {
    const result = await db.runAsync('INSERT INTO category (name) VALUES (?);', [name]);
    const newId = result.lastInsertRowId;
    return { id: newId, name: name };
  } catch (error : any) {
    console.error(`Erro ao adicionar categoria '${name}':`, error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Essa categoria já existe.');
    }
    throw error;
  }
};

/**
 * // NOVO
 * Atualiza o nome de uma categoria.
 */
export const updateCategory = async (id: number, name: string): Promise<void> => {
  const db = await dbPromise;
  try {
    await db.runAsync('UPDATE category SET name = ? WHERE id = ?;', [name, id]);
  } catch (error : any) {
    console.error(`Erro ao atualizar categoria ${id}:`, error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Esse nome de categoria já está em uso.');
    }
    throw error;
  }
};

/**
 * // NOVO
 * Deleta uma categoria.
 * ATENÇÃO: Graças ao "ON DELETE CASCADE" no seu schema,
 * isso irá deletar AUTOMATICAMENTE todas as transações
 * que usavam esta categoria.
 */
export const deleteCategory = async (id: number): Promise<void> => {
  const db = await dbPromise;
  try {
    await db.runAsync('DELETE FROM category WHERE id = ?;', [id]);
    console.log(`Categoria ${id} deletada (e transações associadas).`);
  } catch (error : any) {
    console.error(`Erro ao deletar categoria ${id}:`, error);
    throw error;
  }
};