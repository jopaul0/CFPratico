import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { MainContainer } from '../components/MainContainer';
import { SearchBar } from '../components/SearchBar';
import { Filters, FilterConfig } from '../components/Filters';
import { TransactionDayGroup } from '../components/TransactionDayGroup';

// ------- Tipos de exemplo -------
type Category = 'transporte' | 'alimentacao' | 'servico' | 'outros';
type Tx = {
  id: string;
  category: Category;
  paymentType: string;
  description: string;
  value: number;
  isNegative?: boolean;
  date: string; // YYYY-MM-DD
};

// ------- Dados mockados (poderá trocar por API) -------
const RAW_TRANSACTIONS: Tx[] = [
  { id: '1', category: 'transporte',  paymentType: 'Compra no débito', description: '99* Pop 14out 18h23min Sp', value: 22.10, isNegative: true, date: '2025-10-14' },
  { id: '2', category: 'transporte',  paymentType: 'Compra no débito', description: '99* Pop 14out 08h01min Sp', value: 14.50, isNegative: true, date: '2025-10-14' },
  { id: '3', category: 'alimentacao', paymentType: 'Compra no débito', description: 'Rafaela da Silva Sao Jose',  value: 7.00,  isNegative: true, date: '2025-10-13' },
  { id: '4', category: 'transporte',  paymentType: 'Compra no débito', description: '99* Pop 13out 18h31min Sp', value: 22.10, isNegative: true, date: '2025-10-13' },
  { id: '5', category: 'servico',     paymentType: 'Pix recebido',     description: 'Pagamento cliente XPTO',    value: 150.00, isNegative: false, date: '2025-10-11' },
];

// helper: formata data pt-BR curta
const fmtDateHeader = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
};

// calcula saldo ao fim do dia (exemplo simples cumulativo)
const computeDailyBalance = (txs: Tx[], initialBalance = 2500): Record<string, number> => {
  // ordena por data asc e acumula
  const byDateAsc = [...txs].sort((a, b) => a.date.localeCompare(b.date));
  const result: Record<string, number> = {};
  let running = initialBalance;

  // agrupa por dia e aplica valor
  const grouped: Record<string, Tx[]> = {};
  for (const t of byDateAsc) {
    grouped[t.date] ??= [];
    grouped[t.date].push(t);
  }

  for (const day of Object.keys(grouped)) {
    const dayTxs = grouped[day];
    for (const t of dayTxs) {
      running += t.isNegative ? -t.value : t.value;
    }
    result[day] = running;
  }
  return result;
};

export const StatementScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [paymentType, setPaymentType] = useState<'all' | 'pix' | 'card' | 'boleto' | 'cash'>('all');
  const [category, setCategory] = useState<'all' | 'food' | 'services' | 'taxes' | 'transport'>('all');
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');

  // ---------- Filtros (Pickers) ----------
  const filters: FilterConfig[] = [
    {
      key: 'period',
      label: 'Período',
      options: [
        { label: '7 dias', value: '7d' },
        { label: '30 dias', value: '30d' },
        { label: '90 dias', value: '90d' },
        { label: 'Este ano', value: 'ytd' },
      ],
      selectedValue: period,
      onValueChange: (v) => setPeriod(v as any),
    },
    {
      key: 'category',
      label: 'Categoria',
      options: [
        { label: 'Todas', value: 'all' },
        { label: 'Alimentação', value: 'food' },
        { label: 'Serviços', value: 'services' },
        { label: 'Impostos', value: 'taxes' },
        { label: 'Transporte', value: 'transport' },
      ],
      selectedValue: category,
      onValueChange: (v) => setCategory(v as any),
    },
    {
      key: 'paymentType',
      label: 'Tipo de pagamento',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Pix', value: 'pix' },
        { label: 'Cartão', value: 'card' },
        { label: 'Boleto', value: 'boleto' },
        { label: 'Dinheiro', value: 'cash' },
      ],
      selectedValue: paymentType,
      onValueChange: (v) => setPaymentType(v as any),
    },
  ];

  const handleClearAll = () => {
    setQuery('');
    setPaymentType('all');
    setCategory('all');
    setPeriod('30d');
  };

  const doSearch = () => {
    // aqui você chamaria sua API com query + filtros
    // por enquanto, a lista abaixo já reage aos estados
  };

  // ---------- Aplica filtros nos dados mock ----------
  const filtered = useMemo(() => {
    // filtro por período
    const now = new Date();
    const start = new Date(now);
    if (period === '7d') start.setDate(now.getDate() - 7);
    else if (period === '30d') start.setDate(now.getDate() - 30);
    else if (period === '90d') start.setDate(now.getDate() - 90);
    else if (period === 'ytd') start.setMonth(0, 1);

    const byPeriod = RAW_TRANSACTIONS.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return d >= start && d <= now;
    });

    // filtro por categoria
    const byCategory = byPeriod.filter(t => {
      if (category === 'all') return true;
      if (category === 'food') return t.category === 'alimentacao';
      if (category === 'services') return t.category === 'servico';
      if (category === 'taxes') return t.category === 'outros'; // ajuste conforme seu mapeamento real
      if (category === 'transport') return t.category === 'transporte';
      return true;
    });

    // filtro por tipo de pagamento (mock simples pelo texto)
    const byPayment = byCategory.filter(t => {
      if (paymentType === 'all') return true;
      if (paymentType === 'pix') return /pix/i.test(t.paymentType);
      if (paymentType === 'card') return /cart[aã]o|cr[eé]dito|d[eé]bito/i.test(t.paymentType);
      if (paymentType === 'boleto') return /boleto/i.test(t.paymentType);
      if (paymentType === 'cash') return /dinheiro/i.test(t.paymentType);
      return true;
    });

    // filtro por busca
    const q = query.trim().toLowerCase();
    const byQuery = q.length === 0 ? byPayment : byPayment.filter(t =>
      t.description.toLowerCase().includes(q) ||
      t.paymentType.toLowerCase().includes(q)
    );

    return byQuery;
  }, [period, category, paymentType, query]);

  // ---------- Agrupa por dia e calcula saldo daquele dia ----------
  const groups = useMemo(() => {
    // agrupar por data (desc)
    const map: Record<string, Tx[]> = {};
    for (const t of filtered) {
      map[t.date] ??= [];
      map[t.date].push(t);
    }
    // saldo ao fim do dia (exemplo com saldo inicial fixo)
    const dailyBalance = computeDailyBalance(filtered, 2500);

    // ordena dias desc
    const days = Object.keys(map).sort((a, b) => (a > b ? -1 : 1));
    return days.map((iso) => ({
      dateISO: iso,
      dateLabel: `${fmtDateHeader(iso)}`,
      balance: dailyBalance[iso] ?? 0,
      transactions: map[iso].map(t => ({
        id: t.id,
        category: t.category,
        paymentType: t.paymentType,
        description: t.description,
        value: t.value,
        isNegative: t.isNegative,
      })),
    }));
  }, [filtered]);

  return (
    <MainContainer title="Movimentação">
      {/* Busca */}
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por descrição, valor, categoria…"
        onSubmitSearch={doSearch}
        onClearAll={handleClearAll}
      />

      {/* Filtros (com seu InputGroup por baixo) */}
      <Filters filters={filters} />

      {/* Lista agrupada */}
      <ScrollView className="mt-2">
        <View className="pb-8">
          {groups.map((g) => (
            <TransactionDayGroup
              key={g.dateISO}
              date={g.dateLabel}
              balance={g.balance}
              transactions={g.transactions}
            />
          ))}
        </View>
      </ScrollView>
    </MainContainer>
  );
};
