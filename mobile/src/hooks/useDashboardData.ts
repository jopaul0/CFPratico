// src/hooks/useDashboardData.ts
import { useMemo, useState, useCallback, useEffect } from 'react'; // <-- Mudança: useEffect
// import { useFocusEffect } from '@react-navigation/native'; // <-- REMOVIDO
import * as DB from '../services/database';
import { TransactionWithNames, Category, UserConfig } from '../services/database';
import type { FilterConfig, Option } from '../types/Filters';
import { categoryToSlug } from '../utils/Categories';
import { formatDateToString } from '../utils/Date';
import type { Tx } from '../types/Transactions';
import { useRefresh } from '../contexts/RefreshContext';

// --- (Tipos de dados para agregação) ---
export interface SummaryData {
    totalRevenue: number;
    totalExpense: number;
    netBalance: number;
}

export interface AggregatedData {
    name: string;
    total: number;
    count: number;
    iconName: string;
}

export interface AggregatedDataByDate {
    date: string; // 'YYYY-MM-DD'
    totalRevenue: number;
    totalExpense: number;
}

// --- (Tipo de Retorno do Hook - ATUALIZADO) ---
export interface DashboardData {
    summary: SummaryData;
    byCategoryRevenue: AggregatedData[];
    byCategoryExpense: AggregatedData[];
    byDate: AggregatedDataByDate[];
    recentTransactions: Tx[];
    filteredTransactions: TransactionWithNames[]; 
    rawTransactions: TransactionWithNames[];
    userConfig: UserConfig | null;
    startDate: string;
    endDate: string;
    currentBalance: number; // <-- ADICIONADO
}

const adaptDbTransactionToTx = (dbTx: TransactionWithNames): Tx => {
    // ... (função sem alteração)
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

export const useDashboardData = () => {
    // --- (Estados de Dados) ---
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [rawTransactions, setRawTransactions] = useState<TransactionWithNames[]>([]);
    const [rawCategories, setRawCategories] = useState<Category[]>([]);
    const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

    const { refreshTrigger } = useRefresh(); // Pega o gatilho

    // --- (Carregamento de Dados) ---
    const loadAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [transactions, categories, config] = await Promise.all([
                DB.fetchTransactions(),
                DB.fetchCategories(),
                DB.fetchOrCreateUserConfig(),
            ]);
            setRawTransactions(transactions);
            setRawCategories(categories);
            setUserConfig(config);
        } catch (e) {
            setError(e as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // --- (CORREÇÃO: Troca useFocusEffect por useEffect) ---
    // Agora só recarrega quando o 'refreshTrigger' mudar (ou na primeira vez)
    useEffect(() => {
      loadAllData();
    }, [loadAllData, refreshTrigger]); // <-- Depende do gatilho
    // --- (FIM DA CORREÇÃO) ---


    // --- (Estados de Filtro) ---
    const todayISO = useMemo(() => formatDateToString(new Date()), []);
    const initialDateISO = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return formatDateToString(thirtyDaysAgo);
    }, []);

    const [category, setCategory] = useState<string>('all');
    const [startDate, setStartDate] = useState<string>(initialDateISO);
    const [endDate, setEndDate] = useState<string>(todayISO);
    const [movementType, setMovementType] = useState<'all' | 'revenue' | 'expense'>('all');

    // --- ADICIONADO: Botão de Limpar Filtros ---
    const handleClearAll = useCallback(() => {
        setCategory('all');
        setStartDate(initialDateISO);
        setEndDate(todayISO);
        setMovementType('all');
    }, [initialDateISO, todayISO]);
    // --- FIM DA ADIÇÃO ---

    // Opções para o picker de categoria
    const categoryFilterOptions: Option[] = useMemo(() => {
        const options = rawCategories.map(c => ({
            label: c.name,
            value: categoryToSlug(c.name),
        }));
        options.sort((a, b) => a.label.localeCompare(b.label));
        return [{ label: 'Todas', value: 'all' }, ...options];
    }, [rawCategories]);


    // --- (Lógica de Filtragem - sem alteração) ---
    const filteredTransactions = useMemo(() => {
        let filteredTxs = rawTransactions;
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);
        filteredTxs = filteredTxs.filter(t => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        });
        filteredTxs = filteredTxs.filter(t => {
            if (movementType === 'all') return true;
            return t.type === movementType;
        });
        filteredTxs = filteredTxs.filter(t => {
            if (category === 'all') return true;
            return categoryToSlug(t.category_name || 'Sem Categoria') === category;
        });
        return filteredTxs;
    }, [startDate, endDate, movementType, category, rawTransactions]);


    // --- ADICIONADO: Cálculo do Saldo Atual Total ---
    const currentBalance = useMemo(() => {
        const initialBalance = userConfig?.initial_balance ?? 0;
        // Usa as transações BRUTAS (raw), não as filtradas
        const totalFromTransactions = rawTransactions.reduce((sum, tx) => {
            return sum + tx.value;
        }, 0);
        
        return initialBalance + totalFromTransactions;
    }, [rawTransactions, userConfig]);
    // --- FIM DA ADIÇÃO ---


    // --- (Lógica de Agregação - sem alteração) ---
    const aggregatedData = useMemo(() => {
        const summary: SummaryData = { totalRevenue: 0, totalExpense: 0, netBalance: 0 };
        const catRevenueMap = new Map<string, { total: number; count: number; iconName: string }>();
        const catExpenseMap = new Map<string, { total: number; count: number; iconName: string }>();
        const dateMap = new Map<string, { totalRevenue: number; totalExpense: number }>();

        for (const tx of filteredTransactions) {
            const value = tx.value;
            const categoryName = tx.category_name || 'Sem Categoria';
            const iconName = tx.category_icon_name || 'DollarSign';
            const dateISO = tx.date.split('T')[0];
            const currentDayData = dateMap.get(dateISO) || { totalRevenue: 0, totalExpense: 0 };

            if (tx.type === 'revenue') {
                summary.totalRevenue += value;
                const currentCat = catRevenueMap.get(categoryName) || { total: 0, count: 0, iconName: iconName };
                currentCat.total += value;
                currentCat.count += 1;
                catRevenueMap.set(categoryName, currentCat);
                currentDayData.totalRevenue += value;

            } else if (tx.type === 'expense') {
                summary.totalExpense += value;
                const currentCat = catExpenseMap.get(categoryName) || { total: 0, count: 0, iconName: iconName };
                currentCat.total += value;
                currentCat.count += 1;
                catExpenseMap.set(categoryName, currentCat);
                currentDayData.totalExpense += value;
            }
            dateMap.set(dateISO, currentDayData);
        }
        summary.netBalance = summary.totalRevenue + summary.totalExpense;
        const byCategoryRevenue = Array.from(catRevenueMap.entries()).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.total - a.total);
        const byCategoryExpense = Array.from(catExpenseMap.entries())
            .map(([name, data]) => ({ name, total: Math.abs(data.total), count: data.count, iconName: data.iconName }))
            .sort((a, b) => b.total - a.total);
        const byDate = Array.from(dateMap.entries())
            .map(([date, data]) => ({ date, totalRevenue: data.totalRevenue, totalExpense: Math.abs(data.totalExpense) }))
            .sort((a, b) => a.date.localeCompare(b.date));
        const sortedTxs = [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const recentTransactions = sortedTxs
            .slice(0, 5) 
            .map(adaptDbTransactionToTx);
        
        return {
            summary,
            byCategoryRevenue,
            byCategoryExpense,
            byDate,
            recentTransactions,
            filteredTransactions: filteredTransactions 
        };
    }, [filteredTransactions]); 


    // --- (Configuração dos Filtros para a UI - sem alteração) ---
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
                { label: 'Receita', value: 'revenue' },
                { label: 'Despesa', value: 'expense' },
            ],
            selectedValue: movementType,
            onValueChange: (v) => setMovementType(v as any),
            width: 140,
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
    ];

    // --- (Retorno Final do Hook - ATUALIZADO) ---
    return {
        isLoading,
        error,
        filtersConfig,
        handleClearAll, // <-- ADICIONADO
        ...aggregatedData,
        rawTransactions,
        userConfig,
        startDate,
        endDate,
        currentBalance, // <-- ADICIONADO
    };
};