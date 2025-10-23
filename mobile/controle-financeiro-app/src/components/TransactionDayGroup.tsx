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
  onLongPressItem?: (txId: string) => void;
  isSelectionMode?: boolean;
  selectedIds?: Set<string>;
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

      <Divider colorClass="bg-gray-300" />
      {transactions.map((t) => (
        <TransactionItem
          key={t.id}
          {...t}
          onPress={() => onPressItem?.(t)}
          onLongPress={() => onLongPressItem?.(t.id)}
          isSelected={selectedIds.has(t.id)}
          isSelectionMode={isSelectionMode}
        />
      ))}
    </View>
  );
};