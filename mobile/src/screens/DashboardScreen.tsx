import React from 'react';
import { View, Text, ActivityIndicator, RefreshControl } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer'; 
import { DrawerParamList } from '../types/Navigation';

import { TransactionItem } from '../components/TransactionItem';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import type { Tx } from '../types/Transactions';

import { MainContainer } from '../components/MainContainer';
import { Filters } from '../components/Filters';
import { SummaryCard } from '../components/SummaryCard';
import { useDashboardData } from '../hooks/useDashboardData';
import { CategoryChart } from '../components/charts/CategoryChart';
import { TimeChart } from '../components/charts/TimeChart';


export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

    const {
        isLoading,
        error,
        filtersConfig,
        summary,
        byCategoryRevenue,
        byCategoryExpense,
        byDate,
        recentTransactions,
        reload,
    } = useDashboardData();

    const handleViewAll = () => {
        navigation.navigate('Statement');
    };

    const handlePressItem = (tx: Tx) => {
        navigation.navigate('TransactionDetail', tx);
    };

    const renderContent = () => {
        if (isLoading && !recentTransactions.length) { 
            return <ActivityIndicator size="large" className="mt-16" />;
        }
        
        if (error) {
            return <Text className="mt-16 text-center text-red-500">Erro: {error.message}</Text>;
        }

        return (
            <>
                <View className="flex-row flex-wrap mt-4 -mx-2">
                    <SummaryCard
                        title="Receitas no Período"
                        value={summary.totalRevenue}
                        valueColorClass="text-emerald-600"
                    />
                    <SummaryCard
                        title="Despesas no Período"
                        value={Math.abs(summary.totalExpense)}
                        valueColorClass="text-rose-600"
                    />
                    <SummaryCard
                        title="Saldo do Período"
                        value={summary.netBalance}
                        valueColorClass={summary.netBalance >= 0 ? "text-gray-800" : "text-rose-600"}
                    />
                </View>
                <View className="p-4 bg-white rounded-lg shadow mt-4">
                    <Text className="text-lg font-bold text-gray-800 mb-4">Transações Recentes</Text>
                    {recentTransactions.length > 0 ? (
                        <View>
                            {recentTransactions.map((tx) => (
                                <TransactionItem
                                    key={tx.id}
                                    {...tx}
                                    onPress={() => handlePressItem(tx)}
                                    isSelectionMode={false}
                                />
                            ))}
                            <Divider marginVertical={12} />
                            <SimpleButton
                                title="Ver todas as transações"
                                onPress={handleViewAll}
                                backgroundColor="#f9fafb"
                                textColor="#3b82f6"
                                activeBackgroundColor="#f3f4f6"
                            />
                        </View>
                    ) : (
                        <Text className="text-gray-500">Nenhuma transação encontrada para este período.</Text>
                    )}
                </View>
                <TimeChart
                    title="Receitas x Despesas por Dia"
                    data={byDate}
                />
                <CategoryChart
                    title="Despesas por Categoria"
                    data={byCategoryExpense}
                    colorClass="bg-red-500"
                />
                <CategoryChart
                    title="Receitas por Categoria"
                    data={byCategoryRevenue}
                    colorClass="bg-green-500"
                />
                <View className="h-16" />
            </>
        );
    };

    return (
        <MainContainer
            refreshControl={
                <RefreshControl
                    refreshing={isLoading}
                    onRefresh={reload}
                    colors={['#3b82f6']}
                />
            }
        >
            {/* Filtros */}
            <Filters filters={filtersConfig} />

            {/* Conteúdo */}
            {renderContent()}
            
        </MainContainer>
    );
};