import React from 'react';
import { View, Text } from 'react-native';
import { TransactionItem } from './TransactionItem';
import { Divider } from './Divider';

interface TransactionDayGroupProps {
    date: string;
    balance: number;
    transactions: {
        id: string;
        category: 'transporte' | 'alimentacao' | 'servico' | 'outros';
        paymentType: string;
        description: string;
        value: number;
        isNegative?: boolean;
    }[];
}

export const TransactionDayGroup: React.FC<TransactionDayGroupProps> = ({
    date,
    balance,
    transactions,
}) => {
    const formattedBalance = `R$ ${balance.toFixed(2).replace('.', ',')}`;

    return (
        <View className="mb-5">
            {/* Cabeçalho do dia */}
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-700 font-semibold">{date}</Text>
                <Text className="text-gray-400 text-sm">Saldo: {formattedBalance}</Text>
            </View>

            <Divider />

            <View className="mt-2 space-y-2">
                {/* Lista de transações */}
                {transactions.map((t) => (
                    <TransactionItem
                        key={t.id}
                        category={t.category}
                        paymentType={t.paymentType}
                        description={t.description}
                        value={t.value}
                        isNegative={t.isNegative}
                    />
                ))}
            </View>
        </View>
    );
};
