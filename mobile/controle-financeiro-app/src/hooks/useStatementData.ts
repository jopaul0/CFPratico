// src/hooks/useStatementData.ts

import { useMemo, useState } from 'react';

import type { Tx, TransactionGroup } from '../types/Transactions';
import type { FilterConfig, Option } from '../types/Filters';
import { groupTransactionsByDay } from '../utils/Transactions';
import { ALL_CATEGORY_NAMES, categoryToSlug } from '../config/categories';
import { formatDateToString } from '../utils/Date';

// =========================================================================
// Dados mock
// =========================================================================
const RAW_TRANSACTIONS: Tx[] = [
    { id: '1', date: '2025-10-14', type: 'Despesa', paymentType: 'Cartão de Débito', category: 'Transporte', description: '99* Pop 14out 18h23min Sp', value: 22.10, condition: 'À Vista', installments: 1, isNegative: true },
    { id: '2', date: '2025-10-14', type: 'Despesa', paymentType: 'Pix', category: 'Combustível', description: 'Posto Ipiranga', value: 145.00, condition: 'À Vista', installments: 1, isNegative: true },
    { id: '3', date: '2025-10-13', type: 'Despesa', paymentType: 'Cartão de Crédito', category: 'Fornecedor', description: 'Pagamento Mês 1/3', value: 700.00, condition: 'Parcelado', installments: 3, isNegative: true },
    { id: '4', date: '2025-10-13', type: 'Despesa', paymentType: 'Boleto', category: 'Imposto', description: 'DAS Simples Nacional', value: 500.00, condition: 'À Vista', installments: 1, isNegative: true },
    { id: '5', date: '2025-10-11', type: 'Receita', paymentType: 'Pix', category: 'Prestação de Serviço', description: 'Pagamento cliente XPTO - Consultoria', value: 1500.00, condition: 'À Vista', installments: 1, isNegative: false },
    { id: '6', date: '2025-10-11', type: 'Despesa', paymentType: 'Transferência Bancária TED', category: 'Água', description: 'Pagamento SAAE', value: 85.50, condition: 'À Vista', installments: 1, isNegative: true },
];

const INITIAL_BALANCE = 2500;

// =========================================================================
// Opções de Filtro Estáticas
// =========================================================================
const CATEGORY_FILTER_OPTIONS: Option[] = [
    { label: 'Todas', value: 'all' },
    ...ALL_CATEGORY_NAMES.map(name => ({
        label: name,
        value: categoryToSlug(name),
    }))
];
const PAYMENT_TYPE_FILTER_OPTIONS: Option[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Pix', value: 'Pix' },
    { label: 'Cartão de Crédito', value: 'Cartão de Crédito' },
    { label: 'Cartão de Débito', value: 'Cartão de Débito' },
    { label: 'Boleto', value: 'Boleto' },
    { label: 'Cheque', value: 'Cheque' },
    { label: 'Dinheiro', value: 'Dinheiro' },
    { label: 'Transferência Bancária TED', value: 'Transferência Bancária TED' },
    { label: 'Outros', value: 'Outros' },
];

// =========================================================================
// Custom Hook useStatementData
// =========================================================================
export const useStatementData = () => {
    // Calcula as datas padrão para o reset (30 dias atrás até hoje)
    const todayISO = useMemo(() => formatDateToString(new Date()), []);
    const initialDateISO = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return formatDateToString(thirtyDaysAgo);
    }, []);

    // ===== 1. Estados dos Filtros =====
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<string>('all'); 
    const [paymentType, setPaymentType] = useState<string>('all');
    
    // 🚀 Novos Estados para o Período Customizado
    const [startDate, setStartDate] = useState<string>(initialDateISO);
    const [endDate, setEndDate] = useState<string>(todayISO);

    // 🚀 Novos Estados para Tipo e Parcelas
    const [movementType, setMovementType] = useState<'all' | 'Receita' | 'Despesa'>('all');
    const [installments, setInstallments] = useState<'all' | 'vista' | 'parcelado'>('all');

    // Função de Reset (Agora reseta todos os novos filtros)
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

    // ===== 2. Lógica de Filtro e Agrupamento (useMemo) =====
    const groups: TransactionGroup[] = useMemo(() => {
        
        let filteredTxs = RAW_TRANSACTIONS;

        // --- Período Customizado ---
        // Cria objetos Date para comparação
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
                t.paymentType.toLowerCase().includes(q)
            );
        }

        // --- Ordena e Agrupa ---
        const sortedTxs = filteredTxs.sort((a, b) => b.date.localeCompare(a.date));
        return groupTransactionsByDay(sortedTxs, INITIAL_BALANCE);

    }, [startDate, endDate, movementType, installments, category, paymentType, query]); 


    // ===== 3. Configuração dos Filtros (FilterConfig) =====
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
          options: CATEGORY_FILTER_OPTIONS,
          selectedValue: category,
          onValueChange: (v) => setCategory(v as string),
          width: 240,
        },
        {
          key: 'paymentType',
          label: 'Tipo de Pagamento',
          type: 'picker',
          options: PAYMENT_TYPE_FILTER_OPTIONS,
          selectedValue: paymentType,
          onValueChange: (v) => setPaymentType(v as string),
          width: 240,
        },
    ];

    return {
        groups, query, setQuery, filtersConfig, handleClearAll, doSearch,
    };
};