// src/hooks/useSettings.ts
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import * as DB from '../services/database';
import type { UserConfig } from '../services/database';
import { formatBRLToNumber, formatNumberToBRLInput } from '../utils/Value';

export const useSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // O estado do formulário
  const [companyName, setCompanyName] = useState('');
  const [initialBalanceInput, setInitialBalanceInput] = useState('');

  // A configuração original carregada do banco
  const [originalConfig, setOriginalConfig] = useState<UserConfig | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const config = await DB.fetchOrCreateUserConfig();
      setOriginalConfig(config);
      // Define os valores do formulário com base no que foi carregado
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
      
      // Recarrega os dados para garantir que o "originalConfig" esteja atualizado
      await loadData(); 
      Alert.alert('Sucesso', 'Configurações salvas!');

    } catch (e: any) {
      setError(e);
      Alert.alert('Erro ao Salvar', e.message);
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
    setInitialBalanceInput,
    handleSave,
    reload: loadData,
  };
};