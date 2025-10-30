// src/screens/DashboardScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
// --- REMOVIDO: ViewShot não é mais necessário ---
// import ViewShot from 'react-native-view-shot';

import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';

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
    const [logoBase64, setLogoBase64] = useState<string | null>(null);

    // 2. Carregar a logo (sem mudanças)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const asset = Asset.fromModule(require('../assets/onvale.png'));
                await asset.downloadAsync(); 

                if (Platform.OS === 'web') {
                    const res = await fetch(asset.uri);
                    const blob = await res.blob();
                    const base64 = await new Promise<string>((resolve, reject) => {
                        const r = new FileReader();
                        r.onloadend = () => resolve((r.result as string).split(',')[1] ?? '');
                        r.onerror = reject;
                        r.readAsDataURL(blob);
                    });
                    if (!cancelled) setLogoBase64(base64);
                    return;
                }

                const uri = asset.localUri ?? asset.uri;
                const logoFile = new File(uri);
                const base64 = await logoFile.base64();
                if (!cancelled) setLogoBase64(base64);
            } catch (e) {
                console.error("Erro ao carregar logo 'onvale.png':", e);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // 3. Hook de Dados (sem mudanças)
    const dashboardData = useDashboardData();
    const {
        isLoading,
        error,
        filtersConfig,
        summary,
        byCategoryRevenue,
        byCategoryExpense,
        byDate,
        recentTransactions,
    } = dashboardData;

    // --- 4. MUDANÇA: Hook de Exportação atualizado ---
    const {
        isExporting,
        handleExportExcel,
        handleExportPdf, // <-- Renomeado
        // Refs removidos
    } = useReportExporter({
        data: dashboardData,
        logoBase64: logoBase64,
    });

    // 5. Handlers de Navegação (sem mudanças)
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
                {/* Cards de Resumo */}
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

                {/* Transações Recentes */}
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

                {/* --- MUDANÇA: Gráficos sem ViewShot e sem ref --- */}
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

                {/* --- MUDANÇA: Botão de Exportação com props atualizadas --- */}
                <DashboardExportButton
                    onExportPDF={handleExportPdf}
                    onExportExcel={handleExportExcel}
                    isLoading={isLoading || isExporting || !logoBase64}
                />
            </>
        );
    };

    // 7. Renderização Principal (sem mudanças)
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
            <Filters filters={filtersConfig} />
            {renderContent()}
        </MainContainer>
    );
};