// src/hooks/useAddTransaction.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as DB from '../services/database';
import type { Category, PaymentMethod, TransactionCondition } from '../services/database';
import { parseNumberBR, toISODate } from '../utils/Date';
import { formatBRLInputMask } from '../utils/Value';

type MovementType = 'revenue' | 'expense';
type ConditionType = TransactionCondition;

export type AddTxState = {
  dateISO: string;
  description: string;
  valueInput: string;
  movementType: MovementType;
  condition: ConditionType;
  installments: string;
  paymentMethodId?: number;
  categoryId?: number;
};


export const useAddTransaction = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [state, setState] = useState<AddTxState>({
    dateISO: toISODate(new Date()),
    description: '',
    valueInput: '',
    movementType: 'revenue',
    condition: 'paid',
    installments: '1',
    paymentMethodId: undefined,
    categoryId: undefined,
  });

  const setField = useCallback(<K extends keyof AddTxState>(key: K, value: AddTxState[K]) => {
    if (key === 'valueInput') {
      const maskedValue = formatBRLInputMask(value as string);
      setState(prev => ({ ...prev, [key]: maskedValue }));
    } else {
      setState(prev => ({ ...prev, [key]: value }));
    }
  }, []);

  const installmentsNumber = useMemo(() => {
    const n = parseInt(state.installments || '1', 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }, [state.installments]);

  const loadOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, pms] = await Promise.all([
        DB.fetchCategories(),
        DB.fetchPaymentMethods(),
      ]);
      setCategories(cats);
      setPaymentMethods(pms);

      setState(prev => ({
        ...prev,
        categoryId: prev.categoryId ?? cats[0]?.id,
        paymentMethodId: prev.paymentMethodId ?? pms[0]?.id,
      }));
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOptions(); }, [loadOptions]);

  const validate = useCallback((): string | null => {
    if (!state.dateISO) return 'Informe a data.';
    const v = parseNumberBR(state.valueInput);
    if (v <= 0) return 'Valor deve ser maior que zero.';
    if (!state.categoryId) return 'Selecione uma categoria.';
    if (!state.paymentMethodId) return 'Selecione um método de pagamento.';
    if (state.condition === 'pending' && installmentsNumber < 2) {
      return 'Tenha mais de uma parcela para que seja parcelado.';
    }
    return null;
  }, [state, installmentsNumber]);

  const save = useCallback(async () => {
    const msg = validate();
    if (msg) throw new Error(msg);

    setSaving(true);
    setError(null);
    try {
      const rawValue = parseNumberBR(state.valueInput);
      const signed = state.movementType === 'expense' ? -Math.abs(rawValue) : Math.abs(rawValue);

      await DB.addTransaction({
        date: `${state.dateISO}T00:00:00`,
        description: state.description || null,
        value: signed,
        type: state.movementType,
        condition: state.condition,
        installments: state.condition === 'paid' ? 1 : installmentsNumber,
        paymentMethodId: state.paymentMethodId!,
        categoryId: state.categoryId!,
      });
    } catch (e) {
      setError(e as Error);
      throw e;
    } finally {
      setSaving(false);
    }
  }, [state, installmentsNumber, validate]);

  return {
    loading, saving, error,
    categories, paymentMethods,
    state, setField, save,
  };
};
