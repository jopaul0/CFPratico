import { useState, useCallback, useEffect } from 'react';
import * as DB from '../services/database';
import type { PaymentMethod } from '../types/Database';
import { useRefresh } from '../contexts/RefreshContext';

export const useManagePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [formName, setFormName] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const { triggerReload } = useRefresh();

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

  const handleSelectMethod = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method);
    setFormName(method.name);
  }, []);

  const handleClearForm = useCallback(() => {
    setSelectedMethod(null);
    setFormName('');
  }, []);

  const handleSave = useCallback(async () => {
    if (!formName || formName.trim().length === 0) {
      throw new Error('O nome é obrigatório.');
    }
    setIsSaving(true);
    try {
      if (selectedMethod) {
        await DB.updatePaymentMethod(selectedMethod.id, formName);
      } else {
        await DB.addPaymentMethod(formName);
      }
      handleClearForm();
      await loadPaymentMethods();
      triggerReload();
    } finally {
      setIsSaving(false);
    }
  }, [selectedMethod, formName, loadPaymentMethods, handleClearForm, triggerReload]);

  const handleDelete = useCallback(async (id: number) => {
    if (!id) return;
    try {
      await DB.deletePaymentMethod(id);
      handleClearForm();
      await loadPaymentMethods();
      triggerReload();
    } catch (e) {
      console.error("Erro no hook handleDelete (PaymentMethod):", e);
      throw e;
    }
  }, [loadPaymentMethods, handleClearForm, triggerReload]);

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
    handleDelete,
    reload: loadPaymentMethods,
  };
};