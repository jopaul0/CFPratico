// src/screens/DashboardScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
// ViewShot é necessário para capturar os gráficos
import ViewShot from 'react-native-view-shot';

// Imports para carregar a logo (Base64) - NOVA API
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';

// --- (INÍCIO DA MUDANÇA) ---
// Imports de Navegação
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer'; // <-- Importado para o getParent
import { DrawerParamList, DashboardStackParamList } from '../types/Navigation'; // <-- Adicionado DashboardStackParamList
import type { Tx } from '../types/Transactions';
// --- (FIM DA MUDANÇA) ---

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
    // --- (MUDANÇA NO HOOK) ---
    // Agora usa a Pilha (Stack) interna do Dashboard
    const navigation = useNavigation<NativeStackNavigationProp<DashboardStackParamList>>();

    // --- 1. Estado para a logo em Base64 ---
    const [logoBase64, setLogoBase64] = useState<string | null>(null);

    // --- 2. Carregar a logo "onvale.png" ao iniciar a tela (NOVA API) ---
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                // 1) Resolve e baixa o asset (preenche localUri no native)
                const asset = Asset.fromModule(require('../assets/onvale.png'));
                await asset.downloadAsync(); // garante o arquivo local

                if (Platform.OS === 'web') {
                    // WEB: pegue via fetch e converta para Base64
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

                // 2) NATIVE: crie um File a partir do URI do asset e leia Base64
                const uri = asset.localUri ?? asset.uri; // após downloadAsync, localUri é file://
                const logoFile = new File(uri);
                const base64 = await logoFile.base64(); // API nova do SDK 54
                if (!cancelled) setLogoBase64(base64);
            } catch (e) {
                console.error("Erro ao carregar logo 'onvale.png':", e);
            }
        })();

        return () => { cancelled = true; };
    }, []);

    // --- 3. Hook de Dados ---
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
        // reload, <-- REMOVIDO
    } = dashboardData;

    // --- 4. Hook de Exportação ---
    const {
        isExporting,
        handleExportExcel,
        handleExportPdfSimple,
        handleExportPdfWithCharts,
        timeChartRef,
        expenseChartRef,
        revenueChartRef,
    } = useReportExporter({
        data: dashboardData,
        logoBase64: logoBase64,
    });

    // --- (MUDANÇA NOS HANDLERS) ---
    // --- 5. Handlers de Navegação ---
    const handleViewAll = () => {
        // Pega o "Pai" (Drawer) para trocar de aba
        navigation.getParent<DrawerNavigationProp<DrawerParamList>>()?.navigate('Statement');
    };

    const handlePressItem = (tx: Tx) => {
        // Navega DENTRO da pilha do Dashboard
        navigation.navigate('TransactionDetail', tx);
    };

    const handleAddTransaction = useCallback(() => {
        // Navega DENTRO da pilha do Dashboard
        navigation.navigate('AddTransaction');
    }, [navigation]);
    // --- (FIM DA MUDANÇA NOS HANDLERS) ---


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

                {/* Gráficos envolvidos com ViewShot para captura */}
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

                {/* Botão de Exportação */}
                <DashboardExportButton
                    onExportPDFCharts={handleExportPdfWithCharts}
                    onExportPDFSimple={handleExportPdfSimple}
                    onExportExcel={handleExportExcel}
                    isLoading={isLoading || isExporting || !logoBase64}
                />
            </>
        );
    };

    // --- 7. Renderização Principal ---
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