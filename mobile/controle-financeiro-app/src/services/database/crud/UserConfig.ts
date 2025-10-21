// src/services/database/userConfigRepository.ts
import { dbPromise } from '../connection';
import { UserConfig } from '../../../types/Database';

/**
 * Busca a configuração do usuário (deve haver apenas uma).
 */
export const fetchUserConfig = async (): Promise<UserConfig | null> => {
  const db = await dbPromise;
  try {
    // getFirstAsync retorna o primeiro objeto ou null se não houver
    const result = await db.getFirstAsync<UserConfig>(
      'SELECT * FROM user_config WHERE id = 1;'
    );
    return result;
  } catch (error) {
    console.error('Erro ao buscar config do usuário:', error);
    throw error;
  }
};

/**
 * Salva ou Atualiza a configuração do usuário.
 * Usa ID=1 fixo.
 */
export const saveUserConfig = async (config: Omit<UserConfig, 'id'>): Promise<void> => {
  const db = await dbPromise;
  const { company_name, initial_balance } = config;
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO user_config (id, company_name, initial_balance) VALUES (1, ?, ?);',
      [company_name, initial_balance]
    );
  } catch (error) {
    console.error('Erro ao salvar config do usuário:', error);
    throw error;
  }
};