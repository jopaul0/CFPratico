import React from 'react';
import { View, Text } from 'react-native';
import { TransactionItem } from './TransactionItem';
import { Divider } from './Divider';

import { Tx } from '../types/Transactions'; 
import { formatToBRL } from '../utils/Value';

interface TransactionDayGroupProps {
  date: string;
  balance: number;
  transactions: Tx[];
  onPressItem?: (tx: Tx) => void;
  onLongPressItem?: (txId: string) => void; // Props de seleção
  isSelectionMode?: boolean; // Props de seleção
  selectedIds?: Set<string>; // Props de seleção
}

export const TransactionDayGroup: React.FC<TransactionDayGroupProps> = ({
  date, balance, transactions, onPressItem,
  onLongPressItem,
  isSelectionMode = false,
  selectedIds = new Set(),
}) => {
  const formattedBalance = formatToBRL(balance);

  return (
    <View className="mb-5">
      
      {/* 1. O CABEÇALHO ORIGINAL (Data e Saldo) DEVE ESTAR AQUI */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-black-100 font-semibold">{date}</Text>
        <Text className="text-gray-500 text-sm">Saldo:  {formattedBalance}</Text>
      </View>
      <Divider colorClass="bg-gray-300" />

      {/* 2. O MAP COM AS NOVAS PROPS DE SELEÇÃO */}
      {transactions.map((t) => (
        <TransactionItem
          key={t.id}
          {...t}
          onPress={() => onPressItem?.(t)}
          onLongPress={() => onLongPressItem?.(t.id)} // Prop nova
          isSelected={selectedIds.has(t.id)} // Prop nova
          isSelectionMode={isSelectionMode} // Prop nova
        />
      ))}
    </View>
  );
};