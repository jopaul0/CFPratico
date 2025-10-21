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
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};