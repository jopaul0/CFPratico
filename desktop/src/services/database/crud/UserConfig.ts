// src/services/database/crud/UserConfig.ts
import { db } from '../db';
import { UserConfig } from '../../../types/Database';

// O ID da config é sempre 1
const CONFIG_ID = 1;

/**
 * Salva ou Atualiza a configuração do usuário.
 */
export const saveOrUpdateUserConfig = async (config: Omit<UserConfig, 'id'>): Promise<void> => {
  try {
    // 'put' em Dexie faz 'INSERT OR REPLACE'
    await db.userConfig.put({
      id: CONFIG_ID,
      company_name: config.company_name,
      initial_balance: config.initial_balance
    });
  } catch (error: any) {
    console.error('Erro ao salvar config do usuário:', error);
    throw error;
  }
};


/**
 * Busca a config. Se não existir, cria e retorna a padrão.
 */
export const fetchOrCreateUserConfig = async (): Promise<UserConfig> => {
  try {
    let config = await db.userConfig.get(CONFIG_ID);
    
    if (config) {
      return config; // Encontrou, retorna
    }

    // Não encontrou, cria a padrão
    const defaultConfig: Omit<UserConfig, 'id'> = {
      company_name: null,
      initial_balance: 0.00
    };
    await saveOrUpdateUserConfig(defaultConfig);
    
    // Retorna a config recém-criada
    return { id: CONFIG_ID, ...defaultConfig };

  } catch (error: any) {
    console.error('Erro ao buscar ou criar config do usuário:', error);
    throw error;
  }
};

/**
 * Busca a configuração do usuário (pode retornar null).
 */
export const fetchUserConfig = async (): Promise<UserConfig | null> => {
  try {
    const result = await db.userConfig.get(CONFIG_ID);
    return result || null;
  } catch (error : any) {
    console.error('Erro ao buscar config do usuário:', error);
    throw error;
  }
};