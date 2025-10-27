// src/hooks/useManagePaymentMethods.ts
import { useState, useCallback, useEffect } from 'react';
import * as DB from '../services/database';
import type { PaymentMethod } from '../services/database';

export const useManagePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Estado do formulário
  const [formName, setFormName] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const loadPaymentMethods = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await DB.fetchPaymentMethods();
      setPaymentMethods(data);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  // Preenche o formulário para edição
  const handleSelectMethod = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method);
    setFormName(method.name);
  }, []);

  // Limpa o formulário para adição
  const handleClearForm = useCallback(() => {
    setSelectedMethod(null);
    setFormName('');
  }, []);

  // Salva (cria ou atualiza)
  const handleSave = useCallback(async () => {
    if (!formName || formName.trim().length === 0) {
      throw new Error('O nome é obrigatório.');
    }
    setIsSaving(true);
    try {
      if (selectedMethod) {
        // Atualiza
        await DB.updatePaymentMethod(selectedMethod.id, formName);
      } else {
        // Cria
        await DB.addPaymentMethod(formName);
      }
      handleClearForm();
      await loadPaymentMethods(); // Recarrega a lista
    } finally {
      setIsSaving(false);
    }
  }, [selectedMethod, formName, loadPaymentMethods, handleClearForm]);

  return {
    paymentMethods,
    isLoading,
    isSaving,
    error,
    formName,
    setFormName,
    selectedMethod,
    handleSelectMethod,
    handleClearForm,
    handleSave,
    reload: loadPaymentMethods,
  };
};