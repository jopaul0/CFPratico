import React from 'react';
import { View, ScrollView, Text, ActivityIndicator, RefreshControl } from 'react-native';
// --- (Importações Adicionadas) ---
import { useNavigation } from '@react-navigation/native'; 
import { TransactionItem } from '../components/TransactionItem';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import type { Tx } from '../types/Transactions';

// --- (Importações existentes) ---
import { MainContainer } from '../components/MainContainer';
import { Filters } from '../components/Filters';
import { SummaryCard } from '../components/SummaryCard';
import { useDashboardData } from '../hooks/useDashboardData';
import { CategoryChart } from '../components/charts/CategoryChart';
import { TimeChart } from '../components/charts/TimeChart';


export const DashboardScreen: React.FC = () => {
    // --- (Hook de Navegação) ---
    const navigation = useNavigation();

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

    // --- (BLOCO useFocusEffect REMOVIDO) ---

    // --- (Handlers de Navegação) ---
    const handleViewAll = () => {
        navigation.navigate('Statement' as any);
    };

    const handlePressItem = (tx: Tx) => {
        navigation.navigate('Statement', {
            screen: 'TransactionDetail',
            params: tx
        } as any);
    };

    // ... (função renderContent permanece igual)
    const renderContent = () => {
        if (isLoading && !recentTransactions.length) { 
            return <ActivityIndicator size="large" className="mt-16" />;
        }
        // ... (resto do renderContent) ...
        
        if (error) {
            return <Text className="mt-16 text-center text-red-500">Erro: {error.message}</Text>;
        }

        return (
            <>
                <View className="flex-row flex-wrap mt-4 -mx-2">
                    {/* ... SummaryCards ... */}
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

                {/* ... Transações Recentes ... */}
                <View className="p-4 bg-white rounded-lg shadow mt-4">
                    {/* ... (conteúdo das transações recentes) ... */}
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

                {/* ... TimeChart ... */}
                <TimeChart
                    title="Receitas x Despesas por Dia"
                    data={byDate}
                />
                {/* ... CategoryChart (Despesas) ... */}
                <CategoryChart
                    title="Despesas por Categoria"
                    data={byCategoryExpense}
                    colorClass="bg-red-500"
                />
                {/* ... CategoryChart (Receitas) ... */}
                <CategoryChart
                    title="Receitas por Categoria"
                    data={byCategoryRevenue}
                    colorClass="bg-green-500"
                />
            </>
        );
    };

    return (
        <MainContainer>
            {/* Filtros */}
            <Filters filters={filtersConfig} />

            {/* Conteúdo (Pull-to-Refresh MANTIDO) */}
            <ScrollView 
                className="mt-2 flex-1"
                refreshControl={ 
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={reload}    
                        colors={['#3b82f6']}
                    />
                }
            >
                {renderContent()}
                <View className="h-16" />
            </ScrollView>
        </MainContainer>
    );
};