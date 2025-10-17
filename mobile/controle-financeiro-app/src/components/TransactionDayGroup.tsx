// Componentes/TransactionDayGroup.tsx (Atualizado)

import React from 'react';
import { View, Text } from 'react-native';
import { TransactionItem } from './TransactionItem';
import { Divider } from './Divider';
// 🚀 Importa o tipo Tx do lugar correto
import { Tx } from '../types/Transactions'; 
import { formatToBRL } from '../utils/Value';

// O tipo TxInGroup é substituído por Tx
interface TransactionDayGroupProps {
  date: string;
  balance: number;
  transactions: Tx[]; // Usa o tipo importado
  onPressItem?: (tx: Tx) => void;
}

export const TransactionDayGroup: React.FC<TransactionDayGroupProps> = ({
  date, balance, transactions, onPressItem,
}) => {
  // ... (JSX de renderização permanece o mesmo)
  const formattedBalance = formatToBRL(balance);

  return (
    <View className="mb-5">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-black-100 font-semibold">{date}</Text>
        <Text className="text-gray-500 text-sm">Saldo {formattedBalance}</Text>
      </View>
      <Divider colorClass="bg-gray-300" />
      {transactions.map((t) => (
        <TransactionItem
          key={t.id}
          {...t}
          onPress={() => onPressItem?.(t)}
        />
      ))}
    </View>
  );
};