import React, { useRef } from 'react'; // <-- Importar useRef
import { View, Text, ActivityIndicator, RefreshControl } from 'react-native'; 
// Importar ViewShot
import ViewShot from 'react-native-view-shot';

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

import { DashboardExportButton } from '../components/DashboardExportButton';
// --- (1) Importar o novo hook ---
import { useReportExporter } from '../hooks/useReportExporter';


export const DashboardScreen: React.FC = () => {
    const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

    // --- (2) Usar o hook de dados ---
    const {
        isLoading,
        error,
        filtersConfig,
        summary,
        byCategoryRevenue,
        byCategoryExpense,
        byDate,
        recentTransactions,
        filteredTransactions,
        reload,
    } = useDashboardData();

    const {
        isExporting,
        handleExportExcel,
        handleExportPdfSimple,
        handleExportPdfWithCharts,
        timeChartRef,
        expenseChartRef,
        revenueChartRef,
    } = useReportExporter({
        data: {
            summary,
            byCategoryRevenue,
            byCategoryExpense,
            byDate,
            filteredTransactions
        }
    });

    const handleViewAll = () => {
        navigation.navigate('Statement');
    };

    const handlePressItem = (tx: Tx) => {
        navigation.navigate('Statement', { 
            screen: 'TransactionDetail', 
            params: tx 
        });
    };

    // --- (4) O renderContent agora usa 'ViewShot' ---
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

                {/* --- (5) Anexar as REFs aos gráficos usando ViewShot --- */}
                {/* O ViewShot não deve ter NENHUMA classe de estilo, 
                    para não interferir no layout do componente filho (que já tem 'mt-4') */}
                
                <ViewShot ref={timeChartRef} options={{ format: 'png', quality: 0.9 }}>
                    <TimeChart
                        title="Receitas x Despesas por Dia"
                        data={byDate}
                    />
                </ViewShot>
                
                <ViewShot ref={expenseChartRef} options={{ format: 'png', quality: 0.9 }}>
                    <CategoryChart
                        title="Despesas por Categoria"
                        data={byCategoryExpense}
                        colorClass="bg-red-500"
                    />
                </ViewShot>

                <ViewShot ref={revenueChartRef} options={{ format: 'png', quality: 0.9 }}>
                    <CategoryChart
                        title="Receitas por Categoria"
                        data={byCategoryRevenue}
                        colorClass="bg-green-500"
                    />
                </ViewShot>

                {/* Botão de Exportação (agora com estado de loading) */}
                <DashboardExportButton
                    onExportPDFCharts={handleExportPdfWithCharts}
                    onExportPDFSimple={handleExportPdfSimple}
                    onExportExcel={handleExportExcel}
                    isLoading={isLoading || isExporting} // Desabilitado se carrega dados OU exporta
                />
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