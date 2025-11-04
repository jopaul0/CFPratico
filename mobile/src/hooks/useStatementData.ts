// mobile/src/hooks/useStatementData.ts
import { useMemo, useState, useEffect, useCallback } from 'react';
import * as DB from '../services/database'; 
// ATUALIZADO: Importe o novo tipo de filtro
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

  // ESTE ESTADO AGORA GUARDA OS DADOS JÁ FILTRADOS
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithNames[]>([]);
  
  const [rawCategories, setRawCategories] = useState<Category[]>([]);
  const [rawPaymentMethods, setRawPaymentMethods] = useState<PaymentMethod[]>([]);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

  const { refreshTrigger } = useRefresh();
  
  //STATES DE FILTRO
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

  // --- BUSCA DE DADOS DE SUPORTE (Categorias, Métodos) ---
  // Roda apenas uma vez ou quando o refreshTrigger muda
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


  // --- BUSCA DE TRANSAÇÕES FILTRADAS ---
  // Roda quando qualquer filtro (incluindo refreshTrigger) mudar
  const loadFilteredData = useCallback(async () => {
    // Se as categorias e métodos ainda não carregaram, espere.
    if (!rawCategories.length || !rawPaymentMethods.length) return;

    setIsLoading(true);
    setError(null);
    try {
      // Constrói o objeto de filtros para o SQL
      // Precisamos converter os 'slugs' e 'nomes' de volta para IDs
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
      
      // Busca transações JÁ FILTRADAS
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
      // refreshTrigger não é necessário aqui, pois ele já dispara o useEffect de cima
      // que por sua vez atualiza rawCategories/rawPaymentMethods, disparando este.
  ]);

  useEffect(() => {
    loadFilteredData();
  }, [loadFilteredData]);
  

  const adaptedTransactions: Tx[] = useMemo(
    () => filteredTransactions.map(adaptDbTransactionToTx),
    [filteredTransactions] // <-- Depende apenas das transações já filtradas
  );

  const initialBalance = useMemo(
    () => userConfig?.initial_balance ?? 0, 
    [userConfig]
  );

  // --- OPÇÕES DE FILTRO (Não mudam) ---
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


  // Handles (Não mudam)
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
      // O useEffect [loadFilteredData] já é disparado quando 'query' muda.
      // Mas se o usuário pressionar "buscar" sem mudar o texto,
      // podemos forçar o recarregamento.
      loadFilteredData();
  };
  
  // --- USEMEMO REFEITO ---
  // A lógica de filtragem foi movida para o `loadFilteredData` (e para o SQL)
  // O agrupamento agora só agrupa os dados já filtrados.
  const groups: TransactionGroup[] = useMemo(() => {
    // O `adaptedTransactions` já vem ordenado do DB (via `loadFilteredData`)
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
    // Renomeei para ser explícito
    reload: loadFilteredData, 
  };
};