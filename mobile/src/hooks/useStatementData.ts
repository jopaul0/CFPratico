import { useMemo, useState, useEffect, useCallback } from 'react';

import * as DB from '../services/database'; 
import { TransactionWithNames, Category, PaymentMethod, UserConfig } from '../services/database';

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
    categoryIcon: dbTx.category_icon_name || 'DollarSign', // <--- ADICIONADO
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

  const [rawTransactions, setRawTransactions] = useState<TransactionWithNames[]>([]);
  const [rawCategories, setRawCategories] = useState<Category[]>([]);
  const [rawPaymentMethods, setRawPaymentMethods] = useState<PaymentMethod[]>([]);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

  const { refreshTrigger } = useRefresh();
  

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [transactions, categories, paymentMethods, config] = await Promise.all([
        DB.fetchTransactions(),
        DB.fetchCategories(),
        DB.fetchPaymentMethods(),
        DB.fetchOrCreateUserConfig(),
      ]);

      setRawTransactions(transactions);
      setRawCategories(categories);
      setRawPaymentMethods(paymentMethods);
      setUserConfig(config);

    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData, refreshTrigger]);
  

  const adaptedTransactions: Tx[] = useMemo(
    () => rawTransactions.map(adaptDbTransactionToTx),
    [rawTransactions]
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


  //STATES
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

  // Handles
  const handleClearAll = () => {
    setQuery('');
    setCategory('all');
    setPaymentType('all');
    setStartDate(initialDateISO);
    setEndDate(todayISO);
    setMovementType('all');
    setInstallments('all');
  };

  const doSearch = () => { /* ... */ };
  const groups: TransactionGroup[] = useMemo(() => {
    let filteredTxs = adaptedTransactions; 

    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`); 

    filteredTxs = filteredTxs.filter(t => {
        const d = new Date(`${t.date}T00:00:00`);
        return d >= start && d <= end;
    });

    filteredTxs = filteredTxs.filter(t => {
        if (movementType === 'all') return true;
        return t.type === movementType;
    });

    filteredTxs = filteredTxs.filter(t => {
        if (installments === 'all') return true;
        if (installments === 'vista') return t.condition === 'À Vista';
        if (installments === 'parcelado') return t.condition === 'Parcelado';
        return true;
    });
    
    filteredTxs = filteredTxs.filter(t => {
        if (category === 'all') return true;
        return categoryToSlug(t.category) === category;
    });

    filteredTxs = filteredTxs.filter(t => {
        if (paymentType === 'all') return true;
        return t.paymentType === paymentType;
    });

    const q = query.trim().toLowerCase();
    if (q.length > 0) {
        filteredTxs = filteredTxs.filter(t =>
            t.description.toLowerCase().includes(q) ||
            t.paymentType.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        );
    }


    const sortedTxs = filteredTxs.sort((a, b) => b.date.localeCompare(a.date));
    
    return groupTransactionsByDay(sortedTxs, initialBalance); 

  }, [startDate, endDate, movementType, installments, category, paymentType, query, adaptedTransactions, initialBalance]);


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
    reload: loadAllData,
  };
};