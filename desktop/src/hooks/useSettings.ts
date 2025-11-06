import { useState, useCallback, useEffect } from 'react';
import * as DB from '../services/database';
import type { UserConfig } from '../types/Database';
import { formatBRLToNumber, formatNumberToBRLInput, formatBRLInputMask } from '../utils/Value';

export const useSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [companyName, setCompanyName] = useState('');
  const [initialBalanceInput, setInitialBalanceInput] = useState('');
  const [_originalConfig, setOriginalConfig] = useState<UserConfig | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const config = await DB.fetchOrCreateUserConfig();
      setOriginalConfig(config);
      setCompanyName(config.company_name || '');
      setInitialBalanceInput(formatNumberToBRLInput(config.initial_balance));
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      };

      await DB.saveOrUpdateUserConfig(newConfig);
      await loadData();

    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [companyName, initialBalanceInput, loadData]);


  return {
    isLoading,
    isSaving,
    error,
    companyName,
    setCompanyName,
    initialBalanceInput,
    setInitialBalanceInput: handleBalanceInputChange,
    handleSave,
    reload: loadData,
  };
};