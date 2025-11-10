// src/hooks/useSettings.ts
import { useState, useCallback, useEffect } from 'react';
import * as DB from '../services/database';
import type { UserConfig } from '../types/Database';
import { formatBRLToNumber, formatNumberToBRLInput, formatBRLInputMask } from '../utils/Value';
import { useUserConfig } from './useUserConfig';

export const useSettings = () => {
  const { 
    config, 
    isLoading: isConfigLoading, 
    error: configError, 
    reload: reloadConfig 
  } = useUserConfig();
  
  const [isSaving, setIsSaving] = useState(false);
  
  const [companyName, setCompanyName] = useState('');
  const [initialBalanceInput, setInitialBalanceInput] = useState('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setCompanyName(config.company_name || '');
      setInitialBalanceInput(formatNumberToBRLInput(config.initial_balance));
      setCompanyLogo(config.company_logo || null);
    }
  }, [config]);

  const handleBalanceInputChange = useCallback((text: string) => {
    const maskedValue = formatBRLInputMask(text);
    setInitialBalanceInput(maskedValue);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const balanceValue = formatBRLToNumber(initialBalanceInput);
      if (isNaN(balanceValue)) {
        throw new Error('Valor do Saldo Inicial inválido.');
      }

      const newConfig: Omit<UserConfig, 'id'> = {
        company_name: companyName.trim() || null,
        initial_balance: balanceValue,
        company_logo: companyLogo,
      };

      await DB.saveOrUpdateUserConfig(newConfig);
      reloadConfig();

    } catch (e: any) {
      console.error("Erro ao salvar settings:", e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [companyName, initialBalanceInput, companyLogo, reloadConfig]);


  return {
    isLoading: isConfigLoading,
    isSaving,
    error: configError,
    companyName,
    setCompanyName,
    initialBalanceInput,
    setInitialBalanceInput: handleBalanceInputChange,
    companyLogo,
    setCompanyLogo,
    handleSave,
    reload: reloadConfig,
  };
};