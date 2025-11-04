// src/screens/DashboardScreen.tsx
import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList, DashboardStackParamList } from '../types/Navigation';
import type { Tx } from '../types/Transactions';

// Imports de Componentes
import { TransactionItem } from '../components/TransactionItem';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { MainContainer } from '../components/MainContainer';
import { Filters } from '../components/Filters';
import { SummaryCard } from '../components/SummaryCard';
import { CategoryChart } from '../components/charts/CategoryChart';
import { TimeChart } from '../components/charts/TimeChart';
import { DashboardExportButton } from '../components/DashboardExportButton';

// Imports dos Hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useReportExporter } from '../hooks/useReportExporter';

import { Plus } from 'lucide-react-native';


export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<DashboardStackParamList>>();

   const dashboardData = useDashboardData();
    const {
        isLoading,
        error,
        filtersConfig,
        handleClearAll,
        summary,
        currentBalance,
        byCategoryRevenue,
        byCategoryExpense,
        byDate,
        recentTransactions,
    } = dashboardData;

    // 4. Hook de Exportação (sem alteração)
    const {
        isExporting,
        handleExportExcel,
        handleExportPdf,
    } = useReportExporter({
        data: dashboardData
    });

    // 5. Handlers de Navegação (sem alteração)
    const handleViewAll = () => {
        navigation.getParent<DrawerNavigationProp<DrawerParamList>>()?.navigate('Statement');
    };
    const handlePressItem = (tx: Tx) => {
        navigation.navigate('TransactionDetail', tx);
    };
    const handleAddTransaction = useCallback(() => {
        navigation.navigate('AddTransaction');
    }, [navigation]);


    // --- 6. Renderização do Conteúdo ---
    const renderContent = () => {
        if (isLoading && !recentTransactions.length) {
            return <ActivityIndicator size="large" className="mt-16" />;
        }

        if (error) {
            return <Text className="mt-16 text-center text-red-500">Erro: {error.message}</Text>;
        }

        return (
            <>
                {/* --- (INÍCIO DA ATUALIZAÇÃO) --- */}
                <View className="flex-row flex-wrap mt-4 -mx-2">
                    <SummaryCard
                        title="Saldo Atual"
                        value={currentBalance}
                        valueColorClass={currentBalance >= 0 ? "text-blue-600" : "text-rose-600"}
                    />
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
                </View>
                {/* --- (FIM DA ATUALIZAÇÃO) --- */}


                {/* Transações Recentes (sem alteração) */}
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

                {/* Gráficos (sem alteração) */}
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

                {/* Botão de Exportação (sem alteração) */}
                <DashboardExportButton
                    onExportPDF={handleExportPdf}
                    onExportExcel={handleExportExcel}
                    isLoading={isLoading || isExporting}
                />
            </>
        );
    };

    // 7. Renderização Principal (ATUALIZADO)
    return (
        <MainContainer
            hasButton={true}
            colorButton={'#3b82f6'}
            iconButton={
                <Plus size={30} color="white" />
            }
            onPressButton={
                handleAddTransaction
            }
        >
            {/* --- (INÍCIO DA ATUALIZAÇÃO) --- */}
            <Filters 
                filters={filtersConfig} 
                onClearFilters={handleClearAll} // <-- Passa a função de limpar
            />
            {/* --- (FIM DA ATUALIZAÇÃO) --- */}
            {renderContent()}
        </MainContainer>
    );
};