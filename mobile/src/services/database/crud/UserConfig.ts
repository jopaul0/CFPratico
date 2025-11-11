import { dbPromise } from '../connection';
import { UserConfig } from '../../../types/Database';

export const fetchOrCreateUserConfig = async (): Promise<UserConfig> => {
  const db = await dbPromise;
  try {

    const result = await db.getFirstAsync<UserConfig>(
      'SELECT * FROM user_config WHERE id = 1;'
    );
    
    if (result) {
      return result; 
    }

    const defaultConfig: Omit<UserConfig, 'id'> = {
      company_name: null,
      initial_balance: 0.00,
      company_logo: null
    };
    await saveOrUpdateUserConfig(defaultConfig);
    
    return { id: 1, ...defaultConfig };

  } catch (error: any) {
    console.error('Erro ao buscar ou criar config do usuário:', error);
    throw error;
  }
};

/**
 * Busca a configuração do usuário (pode retornar null).
 */
export const fetchUserConfig = async (): Promise<UserConfig | null> => {
  // ... (código existente, sem alteração)
  const db = await dbPromise;
  try {
    const result = await db.getFirstAsync<UserConfig>(
      'SELECT * FROM user_config WHERE id = 1;'
    );
    return result;
  } catch (error : any) {
    console.error('Erro ao buscar config do usuário:', error);
    throw error;
  }
};

/**
 * Salva ou Atualiza a configuração do usuário.
 * Usa ID=1 fixo.
 */
export const saveOrUpdateUserConfig = async (config: Omit<UserConfig, 'id'>): Promise<void> => {
  const db = await dbPromise;

  const { company_name, initial_balance, company_logo } = config; 
  try {
    await db.runAsync(
      'INSERT OR REPLACE INTO user_config (id, company_name, initial_balance, company_logo) VALUES (1, ?, ?, ?);',
      [company_name, initial_balance, company_logo] 
    );
  } catch (error : any) {
    console.error('Erro ao salvar config do usuário:', error);
    throw error;
  }
};