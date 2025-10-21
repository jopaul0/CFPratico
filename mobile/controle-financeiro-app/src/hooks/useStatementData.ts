import { useMemo, useState, useEffect, useCallback } from 'react';

import * as DB from '../services/database'; 
import { TransactionWithNames, Category, PaymentMethod, UserConfig } from '../services/database';

import type { Tx, TransactionGroup } from '../types/Transactions';
import type { FilterConfig, Option } from '../types/Filters';
import { groupTransactionsByDay } from '../utils/Transactions';
import { categoryToSlug } from '../utils/Categories';
import { formatDateToString } from '../utils/Date';


// 2. FUNÇÃO ADAPTADORA (Converte dados do DB para o formato da sua tela)
const adaptDbTransactionToTx = (dbTx: TransactionWithNames): Tx => {
  return {
    id: dbTx.id.toString(),
    date: dbTx.date.split('T')[0], // Converte '2025-10-21T18:00Z' para '2025-10-21'
    type: dbTx.type === 'revenue' ? 'Receita' : 'Despesa',
    paymentType: dbTx.payment_method_name || 'N/A',
    category: dbTx.category_name || 'Sem Categoria',
    description: dbTx.description || '',
    value: Math.abs(dbTx.value), // Assumindo que seu 'value' mockado era sempre positivo
    condition: dbTx.condition === 'paid' ? 'À Vista' : 'Parcelado', // Ajuste conforme sua lógica
    installments: dbTx.installments,
    isNegative: dbTx.type === 'expense',
  };
};

export const useStatementData = () => {

  // =========================================================================
  // 3. ESTADOS DE DADOS (Substituindo o MOCK)
  // =========================================================================
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Dados brutos vindos do banco
  const [rawTransactions, setRawTransactions] = useState<TransactionWithNames[]>([]);
  const [rawCategories, setRawCategories] = useState<Category[]>([]);
  const [rawPaymentMethods, setRawPaymentMethods] = useState<PaymentMethod[]>([]);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);
  
  // =========================================================================
  // 4. CARREGAMENTO DOS DADOS (Substituindo o MOCK)
  // =========================================================================
  
  // Função para carregar TUDO do banco de uma vez
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Puxa tudo em paralelo para ser mais rápido
      const [transactions, categories, paymentMethods, config] = await Promise.all([
        DB.fetchTransactions(),
        DB.fetchCategories(),
        DB.fetchPaymentMethods(),
        DB.fetchOrCreateUserConfig(), // Pega a config ou cria a padrão
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

  // Roda o carregamento na primeira vez que o hook for usado
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  
  // =========================================================================
  // 5. DADOS ADAPTADOS (Substituindo o MOCK)
  // =========================================================================

  // Adapta as transações do DB para o formato 'Tx' que seu hook usa
  const adaptedTransactions: Tx[] = useMemo(
    () => rawTransactions.map(adaptDbTransactionToTx),
    [rawTransactions]
  );
  
  // Pega o balanço inicial da config
  const initialBalance = useMemo(
    () => userConfig?.initial_balance ?? 0, 
    [userConfig]
  );

  // Gera as opções de filtro de Categoria DINAMICAMENTE
  const categoryFilterOptions: Option[] = useMemo(() => {
    const options = rawCategories.map(c => ({
      label: c.name,
      value: categoryToSlug(c.name), // Usa sua função utilitária
    }));
    // Ordena alfabeticamente
    options.sort((a, b) => a.label.localeCompare(b.label));
    return [{ label: 'Todas', value: 'all' }, ...options];
  }, [rawCategories]);

  // Gera as opções de filtro de Pagamento DINAMICAMENTE
  const paymentTypeFilterOptions: Option[] = useMemo(() => {
    const options = rawPaymentMethods.map(p => ({
      label: p.name,
      value: p.name, // O seu filtro antigo usava o nome direto
    }));
    // Ordena alfabeticamente
    options.sort((a, b) => a.label.localeCompare(b.label));
    return [{ label: 'Todos', value: 'all' }, ...options];
  }, [rawPaymentMethods]);


  // =========================================================================
  // 6. LÓGICA DE FILTRO E ESTADOS (Seu código original, sem alteração)
  // =========================================================================
  
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

  // ===== 7. Lógica de Filtro e Agrupamento (Modificada) =====
  const groups: TransactionGroup[] = useMemo(() => {
    
    // MODIFICADO: Usa os dados adaptados do banco, não o MOCK
    let filteredTxs = adaptedTransactions; 

    // --- Período Customizado ---
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T23:59:59`); 

    filteredTxs = filteredTxs.filter(t => {
        const d = new Date(`${t.date}T00:00:00`);
        return d >= start && d <= end;
    });

    // --- Tipo de Movimentação (Receita/Despesa) ---
    filteredTxs = filteredTxs.filter(t => {
        if (movementType === 'all') return true;
        return t.type === movementType;
    });

    // --- Condição (À Vista / Parcelado) ---
    filteredTxs = filteredTxs.filter(t => {
        if (installments === 'all') return true;
        if (installments === 'vista') return t.condition === 'À Vista';
        if (installments === 'parcelado') return t.condition === 'Parcelado';
        return true;
    });
    
    // --- Categoria (Usa Slug) ---
    filteredTxs = filteredTxs.filter(t => {
        if (category === 'all') return true;
        return categoryToSlug(t.category) === category;
    });

    // --- Tipo de Pagamento ---
    filteredTxs = filteredTxs.filter(t => {
        if (paymentType === 'all') return true;
        return t.paymentType === paymentType;
    });

    // --- Busca por Texto ---
    const q = query.trim().toLowerCase();
    if (q.length > 0) {
        filteredTxs = filteredTxs.filter(t =>
            t.description.toLowerCase().includes(q) ||
            t.paymentType.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q)
        );
    }

    // --- Ordena e Agrupa ---
    const sortedTxs = filteredTxs.sort((a, b) => b.date.localeCompare(a.date));
    
    // MODIFICADO: Usa o balanço vindo do banco
    return groupTransactionsByDay(sortedTxs, initialBalance); 

  // MODIFICADO: A dependência agora é dos dados adaptados
  }, [startDate, endDate, movementType, installments, category, paymentType, query, adaptedTransactions, initialBalance]);


  // ===== 8. Configuração dos Filtros (Modificada) =====
  const filtersConfig: FilterConfig[] = [
      // Filtros de Data
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
      // Filtro de Tipo (Receita/Despesa)
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
      // Filtro de Condição (Parcelas)
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
        options: categoryFilterOptions, // MODIFICADO: usa as opções do banco
        selectedValue: category,
        onValueChange: (v) => setCategory(v as string),
        width: 240,
      },
      {
        key: 'paymentType',
        label: 'Tipo de Pagamento',
        type: 'picker',
        options: paymentTypeFilterOptions, // MODIFICADO: usa as opções do banco
        selectedValue: paymentType,
        onValueChange: (v) => setPaymentType(v as string),
        width: 240,
      },
  ];

  // ===== 9. Retorno Final (Modificado) =====
  return {
    groups,
    query,
    setQuery,
    filtersConfig,
    handleClearAll,
    doSearch,
    isLoading, // NOVO: exporta o estado de carregamento
    error,     // NOVO: exporta o estado de erro
    reload: loadAllData, // NOVO: exporta uma função para recarregar
  };
};