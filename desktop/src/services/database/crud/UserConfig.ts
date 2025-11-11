import { db } from '../db';
import { UserConfig } from '../../../types/Database';

const CONFIG_ID = 1;

export const saveOrUpdateUserConfig = async (config: Omit<UserConfig, 'id'>): Promise<void> => {
  try {
    await db.userConfig.put({
      id: CONFIG_ID,
      company_name: config.company_name,
      initial_balance: config.initial_balance,
      company_logo: config.company_logo
    });
  } catch (error: any) {
    console.error('Erro ao salvar config do usuário:', error);
    throw error;
  }
};

export const fetchOrCreateUserConfig = async (): Promise<UserConfig> => {
  try {
    let config = await db.userConfig.get(CONFIG_ID);
    
    if (config) {
      return config;
    }
    const defaultConfig: Omit<UserConfig, 'id'> = {
      company_name: null,
      initial_balance: 0.00,
      company_logo: null
    };
    await saveOrUpdateUserConfig(defaultConfig);
    
    return { id: CONFIG_ID, ...defaultConfig };

  } catch (error: any) {
    console.error('Erro ao buscar ou criar config do usuário:', error);
    throw error;
  }
};

export const fetchUserConfig = async (): Promise<UserConfig | null> => {
  try {
    const result = await db.userConfig.get(CONFIG_ID);
    return result || null;
  } catch (error : any) {
    console.error('Erro ao buscar config do usuário:', error);
    throw error;
  }
};