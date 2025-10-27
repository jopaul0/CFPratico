// src/services/database/crud/Category.ts
import { dbPromise } from '../connection';
// Importa o tipo 'Category' de 'Database.ts' que já inclui 'icon_name'
import { Category } from '../../../types/Database'; 

/**
 * Busca todas as categorias.
 */
export const fetchCategories = async (): Promise<Category[]> => {
  const db = await dbPromise;
  try {
    // A query já está correta se a tabela foi criada com 'icon_name'
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
 * // ATUALIZADO: para incluir iconName
 */
export const addCategory = async (name: string, iconName: string): Promise<Category> => {
  const db = await dbPromise;
  try {
    const result = await db.runAsync(
      'INSERT INTO category (name, icon_name) VALUES (?, ?);', 
      [name, iconName]
    );
    const newId = result.lastInsertRowId;
    return { id: newId, name: name, icon_name: iconName }; // Retorna o objeto completo
  } catch (error : any) {
    console.error(`Erro ao adicionar categoria '${name}':`, error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Essa categoria já existe.');
    }
    throw error;
  }
};

/**
 * Atualiza o nome e o ícone de uma categoria.
 * // ATUALIZADO: para incluir iconName
 */
export const updateCategory = async (id: number, name: string, iconName: string): Promise<void> => {
  const db = await dbPromise;
  try {
    await db.runAsync(
      'UPDATE category SET name = ?, icon_name = ? WHERE id = ?;', 
      [name, iconName, id]
    );
  } catch (error : any) {
    console.error(`Erro ao atualizar categoria ${id}:`, error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      throw new Error('Esse nome de categoria já está em uso.');
    }
    throw error;
  }
};

/**
 * Deleta uma categoria.
 * (Sem alteração)
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