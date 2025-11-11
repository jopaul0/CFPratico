import { useState, useEffect, useCallback } from 'react';
import * as DB from '../services/database';
import type { UserConfig } from '../types/Database';
import { useRefresh } from '../contexts/RefreshContext';

export const useUserConfig = () => {
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { refreshTrigger } = useRefresh();

  const loadConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {

      const userConfig = await DB.fetchOrCreateUserConfig();
      setConfig(userConfig);

      
    } catch (e: any) {
      console.error("Erro ao carregar UserConfig:", e);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig, refreshTrigger]);

  return { config, isLoading, error, reload: loadConfig };
};