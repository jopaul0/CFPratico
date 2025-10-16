import React from 'react';
import { View, Text } from 'react-native';
import { TransactionItem } from './TransactionItem';
import { Divider } from './Divider';
import { ISODate } from '../types/Date';

interface TxInGroup {
  id: string;
  category: 'transporte' | 'alimentacao' | 'servico' | 'outros';
  paymentType: string;
  description: string;
  value: number;
  isNegative?: boolean;
  date?: ISODate;
}

interface TransactionDayGroupProps {
  date: string;
  balance: number;
  transactions: TxInGroup[];
  onPressItem?: (tx: TxInGroup) => void;
}

export const TransactionDayGroup: React.FC<TransactionDayGroupProps> = ({
  date, balance, transactions, onPressItem,
}) => {
  const formattedBalance = `R$ ${balance.toFixed(2).replace('.', ',')}`;

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
