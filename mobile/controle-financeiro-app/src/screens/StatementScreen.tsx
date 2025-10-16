import React, { useState } from 'react';
import { View } from 'react-native';
import { SearchBar } from '../components/SearchBar';
import { Filters, FilterConfig } from '../components/Filters';
import { MainContainer } from '../components/MainContainer';

export const StatementScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [paymentType, setPaymentType] = useState('all');
  const [category, setCategory] = useState('all');
  const [period, setPeriod] = useState('30d');

  const filters: FilterConfig[] = [
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
      onValueChange: setPaymentType,
    },
    {
      key: 'category',
      label: 'Categoria',
      options: [
        { label: 'Todas', value: 'all' },
        { label: 'Alimentação', value: 'food' },
        { label: 'Serviços', value: 'services' },
        { label: 'Impostos', value: 'taxes' },
      ],
      selectedValue: category,
      onValueChange: setCategory,
    },
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
      onValueChange: setPeriod,
    },
  ];

  const handleClearAll = () => {
    setQuery('');
    setPaymentType('all');
    setCategory('all');
    setPeriod('30d');
  };

  const doSearch = () => {
    // sua lógica de busca usando query + filtros
  };

  return (
    <MainContainer title='Movimentação'>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por descrição, valor, categoria…"
        onSubmitSearch={doSearch}
        onClearAll={handleClearAll}
      />
      <Filters filters={filters} />
      {/* … resto da tela */}
    </MainContainer>
  );
};
