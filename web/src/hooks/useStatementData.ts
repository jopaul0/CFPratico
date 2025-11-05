// src/hooks/useStatementData.ts
import { useMemo, useState, useEffect, useCallback } from 'react';
import * as DB from '../services/database'; 
import { 
    TransactionWithNames, 
    Category, 
    PaymentMethod, 
    UserConfig, 
    FetchTransactionsFilters 
} from '../services/database';

import type { Tx, TransactionGroup } from '../types/Transactions';
import type { FilterConfig, Option } from '../types/Filters';
import { groupTransactionsByDay } from '../utils/Transactions';
import { categoryToSlug } from '../utils/Categories';
import { formatDateToString } from '../utils/Date';
import { useRefresh } from '../contexts/RefreshContext';


const adaptDbTransactionToTx = (dbTx: TransactionWithNames): Tx => {
  return {
    id: dbTx.id.toString(),
    date: dbTx.date.split('T')[0],
    type: dbTx.type === 'revenue' ? 'Receita' : 'Despesa',
    paymentType: dbTx.payment_method_name || 'N/A',
    category: dbTx.category_name || 'Sem Categoria',
    categoryIcon: dbTx.category_icon_name || 'DollarSign',
    description: dbTx.description || '',
    value: Math.abs(dbTx.value),
    condition: dbTx.condition === 'paid' ? 'À Vista' : 'Parcelado',
    installments: dbTx.installments,
    isNegative: dbTx.type === 'expense',
  };
};

export const useStatementData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithNames[]>([]);
  
  const [rawCategories, setRawCategories] = useState<Category[]>([]);
  const [rawPaymentMethods, setRawPaymentMethods] = useState<PaymentMethod[]>([]);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

  const { refreshTrigger } = useRefresh();
  
  const todayISO = useMemo(() => formatDateToString(new Date()), []);
  const initialDateISO = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return formatDateToString(thirtyDaysAgo);
  }, []);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [paymentType, setPaymentType] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>(initialDateISO);
  const [endDate, setEndDate] = useState<string>(todayISO);
  const [movementType, setMovementType] = useState<'all' | 'Receita' | 'Despesa'>('all');
  const [installments, setInstallments] = useState<'all' | 'vista' | 'parcelado'>('all');

  useEffect(() => {
    const loadSupportData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [categories, paymentMethods, config] = await Promise.all([
          DB.fetchCategories(),
          DB.fetchPaymentMethods(),
          DB.fetchOrCreateUserConfig(),
        ]);
        setRawCategories(categories);
        setRawPaymentMethods(paymentMethods);
        setUserConfig(config);
      } catch (e) {
        setError(e as Error);
      } finally {
        setIsLoading(false);
      }
    };
    loadSupportData();
  }, [refreshTrigger]);

  const loadFilteredData = useCallback(async () => {
    if (!rawCategories.length || !rawPaymentMethods.length) return;

    setIsLoading(true);
    setError(null);
    try {
      const categoryId = rawCategories.find(c => categoryToSlug(c.name) === category)?.id;
      const paymentMethodId = rawPaymentMethods.find(p => p.name === paymentType)?.id;

      const filters: DB.FetchTransactionsFilters = {
        startDate,
        endDate,
        query: query.trim(),
        type: movementType === 'all' ? undefined : (movementType === 'Receita' ? 'revenue' : 'expense'),
        condition: installments === 'all' ? undefined : (installments === 'vista' ? 'paid' : 'pending'),
        categoryId: category === 'all' ? undefined : categoryId,
        paymentMethodId: paymentType === 'all' ? undefined : paymentMethodId,
      };
      
      const transactions = await DB.fetchTransactions(filters);
      setFilteredTransactions(transactions);

    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [
      startDate, endDate, query, movementType, installments, 
      category, paymentType, rawCategories, rawPaymentMethods
  ]);

  useEffect(() => {
    loadFilteredData();
  }, [loadFilteredData]);
  

  const adaptedTransactions: Tx[] = useMemo(
    () => filteredTransactions.map(adaptDbTransactionToTx),
    [filteredTransactions]
  );

  const initialBalance = useMemo(
    () => userConfig?.initial_balance ?? 0, 
    [userConfig]
  );

  const categoryFilterOptions: Option[] = useMemo(() => {
    const options = rawCategories.map(c => ({
      label: c.name,
      value: categoryToSlug(c.name),
    }));
    options.sort((a, b) => a.label.localeCompare(b.label));
    return [{ label: 'Todas', value: 'all' }, ...options];
  }, [rawCategories]);

  const paymentTypeFilterOptions: Option[] = useMemo(() => {
    const options = rawPaymentMethods.map(p => ({
      label: p.name,
      value: p.name,
    }));
    options.sort((a, b) => a.label.localeCompare(b.label));
    return [{ label: 'Todos', value: 'all' }, ...options];
  }, [rawPaymentMethods]);


  const handleClearAll = () => {
    setQuery('');
    setCategory('all');
    setPaymentType('all');
    setStartDate(initialDateISO);
    setEndDate(todayISO);
    setMovementType('all');
    setInstallments('all');
  };

  const doSearch = () => {
      loadFilteredData();
  };
  
  const groups: TransactionGroup[] = useMemo(() => {
    return groupTransactionsByDay(adaptedTransactions, initialBalance); 
  }, [adaptedTransactions, initialBalance]);


  const filtersConfig: FilterConfig[] = [
      {
        key: 'dateStart',
        label: 'Data Inicial',
        type: 'date',
        value: startDate,
        onChange: setStartDate,
        width: 150,
      },
      {
        key: 'dateEnd',
        label: 'Data Final',
        type: 'date',
        value: endDate,
        onChange: setEndDate,
        width: 150,
      },
      {
        key: 'movementType',
        label: 'Tipo',
        type: 'picker',
        options: [
            { label: 'Todos', value: 'all' },
            { label: 'Receita', value: 'Receita' },
            { label: 'Despesa', value: 'Despesa' },
        ],
        selectedValue: movementType,
        onValueChange: (v) => setMovementType(v as any),
        width: 140,
      },
      {
        key: 'installments',
        label: 'Condição',
        type: 'picker',
        options: [
            { label: 'Todos', value: 'all' },
            { label: 'À Vista', value: 'vista' },
            { label: 'Parcelado', value: 'parcelado' },
        ],
        selectedValue: installments,
        onValueChange: (v) => setInstallments(v as any),
        width: 150,
      },
      {
        key: 'category',
        label: 'Categoria',
        type: 'picker',
        options: categoryFilterOptions,
        selectedValue: category,
        onValueChange: (v) => setCategory(v as string),
        width: 240,
      },
      {
        key: 'paymentType',
        label: 'Tipo de Pagamento',
        type: 'picker',
        options: paymentTypeFilterOptions,
        selectedValue: paymentType,
        onValueChange: (v) => setPaymentType(v as string),
        width: 240,
      },
  ];

  return {
    groups,
    query,
    setQuery,
    filtersConfig,
    handleClearAll,
    doSearch,
    isLoading,
    error,
    reload: loadFilteredData, 
  };
};