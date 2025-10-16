// screens/StatementScreen.tsx
import React, { useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { MainContainer } from '../components/MainContainer';
import { SearchBar } from '../components/SearchBar';
import { Filters, FilterConfig } from '../components/Filters';
import { TransactionDayGroup } from '../components/TransactionDayGroup';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StatementStackParamList } from '../types/Navigation';
import type { ISODate } from '../types/Date';

// ===== Tipos =====
type Category = 'transporte' | 'alimentacao' | 'servico' | 'outros';

type Tx = {
  id: string;
  category: Category;
  paymentType: string;
  description: string;
  value: number;
  isNegative?: boolean;
  date: ISODate; // "YYYY-MM-DD"
};

// ===== Dados mock (substitua por API) =====
const RAW_TRANSACTIONS: Tx[] = [
  { id: '1', category: 'transporte',  paymentType: 'Compra no débito', description: '99* Pop 14out 18h23min Sp', value: 22.10, isNegative: true,  date: '2025-10-14' },
  { id: '2', category: 'transporte',  paymentType: 'Compra no débito', description: '99* Pop 14out 08h01min Sp', value: 14.50, isNegative: true,  date: '2025-10-14' },
  { id: '3', category: 'alimentacao', paymentType: 'Compra no débito', description: 'Rafaela da Silva São José',  value: 7.00,  isNegative: true,  date: '2025-10-13' },
  { id: '4', category: 'transporte',  paymentType: 'Compra no débito', description: '99* Pop 13out 18h31min Sp', value: 22.10, isNegative: true,  date: '2025-10-13' },
  { id: '5', category: 'servico',     paymentType: 'Pix recebido',     description: 'Pagamento cliente XPTO',    value: 150.00, isNegative: false, date: '2025-10-11' },
];

// ===== Helpers =====
const fmtDateHeader = (iso: ISODate) => {
  const d = new Date(`${iso}T00:00:00`);
  // ex.: "ter., 14/10/2025"
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// saldo “ao fim do dia” (exemplo cumulativo com saldo inicial)
const computeDailyBalance = (txs: Tx[], initialBalance = 2500): Record<ISODate, number> => {
  // ordenar asc por ISODate
  const byDateAsc = [...txs].sort((a, b) => a.date.localeCompare(b.date));
  const result: Record<ISODate, number> = {} as Record<ISODate, number>;
  let running = initialBalance;

  const grouped: Record<ISODate, Tx[]> = {} as Record<ISODate, Tx[]>;
  for (const t of byDateAsc) {
    (grouped[t.date] ??= []).push(t);
  }

  for (const day of Object.keys(grouped) as ISODate[]) {
    for (const t of grouped[day]) {
      running += t.isNegative ? -t.value : t.value;
    }
    result[day] = running;
  }
  return result;
};

export const StatementScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<StatementStackParamList>>();

  // ===== Estados dos filtros/busca =====
  const [query, setQuery] = useState('');
  const [paymentType, setPaymentType] = useState<'all' | 'pix' | 'card' | 'boleto' | 'cash'>('all');
  const [category, setCategory] = useState<'all' | 'food' | 'services' | 'taxes' | 'transport'>('all');
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'ytd'>('30d');

  // ===== Config dos Pickers (usa seu InputGroup por baixo) =====
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
    // se for chamar API, use query + states dos filtros aqui
  };

  // ===== Aplica filtros nos dados =====
  const filtered = useMemo(() => {
    // período
    const now = new Date();
    const start = new Date(now);
    if (period === '7d') start.setDate(now.getDate() - 7);
    else if (period === '30d') start.setDate(now.getDate() - 30);
    else if (period === '90d') start.setDate(now.getDate() - 90);
    else if (period === 'ytd') start.setMonth(0, 1);

    const byPeriod = RAW_TRANSACTIONS.filter(t => {
      const d = new Date(`${t.date}T00:00:00`);
      return d >= start && d <= now;
    });

    // categoria (mapeando seus valores para os do item)
    const byCategory = byPeriod.filter(t => {
      if (category === 'all') return true;
      if (category === 'food') return t.category === 'alimentacao';
      if (category === 'services') return t.category === 'servico';
      if (category === 'taxes') return t.category === 'outros'; // ajuste se tiver uma categoria real de impostos
      if (category === 'transport') return t.category === 'transporte';
      return true;
    });

    // tipo pagamento (heurística simples pelo texto)
    const byPayment = byCategory.filter(t => {
      if (paymentType === 'all') return true;
      if (paymentType === 'pix') return /pix/i.test(t.paymentType);
      if (paymentType === 'card') return /cart[aã]o|cr[eé]dito|d[eé]bito/i.test(t.paymentType);
      if (paymentType === 'boleto') return /boleto/i.test(t.paymentType);
      if (paymentType === 'cash') return /dinheiro/i.test(t.paymentType);
      return true;
    });

    // busca
    const q = query.trim().toLowerCase();
    const byQuery = q.length === 0 ? byPayment : byPayment.filter(t =>
      t.description.toLowerCase().includes(q) ||
      t.paymentType.toLowerCase().includes(q)
    );

    // ordena desc por data (para exibir)
    return byQuery.sort((a, b) => b.date.localeCompare(a.date));
  }, [period, category, paymentType, query]);

  // ===== Agrupa por dia + calcula saldo do dia =====
  const groups = useMemo(() => {
    const map: Record<ISODate, Tx[]> = {} as Record<ISODate, Tx[]>;
    for (const t of filtered) {
      (map[t.date] ??= []).push(t);
    }

    const dailyBalance = computeDailyBalance(filtered, 2500);
    const days = Object.keys(map).sort((a, b) => b.localeCompare(a)) as ISODate[];

    return days.map((iso) => ({
      dateISO: iso as ISODate,
      dateLabel: fmtDateHeader(iso as ISODate),
      balance: dailyBalance[iso] ?? 0,
      transactions: map[iso].map(t => ({
        id: t.id,
        category: t.category,
        paymentType: t.paymentType,
        description: t.description,
        value: t.value,
        isNegative: t.isNegative,
        date: t.date, // ISODate
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

      {/* Filtros */}
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
              onPressItem={(tx) =>
                navigation.navigate('TransactionDetail', {
                  id: tx.id,
                  category: tx.category,
                  paymentType: tx.paymentType,
                  description: tx.description,
                  value: tx.value,
                  isNegative: tx.isNegative,
                  date: tx.date,
                })
              }
            />
          ))}
        </View>
      </ScrollView>
    </MainContainer>
  );
};
