// src/screens/DashboardScreen.tsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Tx } from '../types/Transactions';

// Componentes de UI
import { TransactionItem } from '../components/TransactionItem';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { MainContainer } from '../components/MainContainer';
import { Filters } from '../components/Filters';
import { SummaryCard } from '../components/SummaryCard';
import { CategoryChart } from '../components/charts/CategoryChart';
import { TimeChart } from '../components/charts/TimeChart';
import { DashboardExportButton } from '../components/DashboardExportButton';

// Hooks
import { useDashboardData } from '../hooks/useDashboardData';
import { useReportExporter } from '../hooks/useReportExporter';

import { Plus } from 'lucide-react';

export const DashboardScreen: React.FC = () => {
    const navigate = useNavigate();
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
        reload
    } = dashboardData;

    const {
        isExporting,
        handleExportExcel,
        handleExportPdf,
    } = useReportExporter({
        data: dashboardData
    });

    // Handlers de Navegação
    const handleViewAll = () => navigate('/statement');
    // handlePressItem é tratado pelo próprio TransactionItem (que é um <Link>)
    const handleAddTransaction = () => navigate('/statement/new');


    const renderContent = () => {
        if (isLoading && !recentTransactions.length) {
            return <div className="mt-16 text-center">Carregando...</div>;
        }

        if (error) {
            return <p className="mt-16 text-center text-red-500">Erro: {error.message}</p>;
        }

        return (
            <>
                {/* --- Resumo (Responsivo por padrão) --- */}
                <div className="flex flex-row flex-wrap -mx-2">
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
                </div>

                {/* --- Transações Recentes --- */}
                <div className="p-4 bg-white rounded-lg shadow mt-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Transações Recentes</h2>
                    {recentTransactions.length > 0 ? (
                        <div>
                            {recentTransactions.map((tx) => (
                                <TransactionItem
                                    key={tx.id}
                                    {...tx}
                                    isSelectionMode={false}
                                />
                            ))}
                            <Divider className="my-4" />
                            <SimpleButton
                                title="Ver todas as transações"
                                onPress={handleViewAll}
                                className="w-full bg-gray-50 hover:bg-gray-100 text-blue-600"
                            />
                        </div>
                    ) : (
                        <p className="text-gray-500">Nenhuma transação encontrada para este período.</p>
                    )}
                </div>

                {/* --- Gráficos --- */}
                <TimeChart
                    title="Receitas x Despesas por Dia"
                    data={byDate}
                />
                
                {/* --- Layout Responsivo para Gráficos de Categoria --- */}
                <div className="lg:flex lg:gap-4">
                    <div className="lg:w-1/2">
                        <CategoryChart
                            title="Despesas por Categoria"
                            data={byCategoryExpense}
                            colorClass="bg-red-500"
                        />
                    </div>
                    <div className="lg:w-1/2">
                        <CategoryChart
                            title="Receitas por Categoria"
                            data={byCategoryRevenue}
                            colorClass="bg-green-500"
                        />
                    </div>
                </div>

                <DashboardExportButton
                    onExportPDF={handleExportPdf}
                    onExportExcel={handleExportExcel}
                    isLoading={isLoading || isExporting}
                />
            </>
        );
    };

    return (
        <>
            <MainContainer>
                <Filters
                    filters={filtersConfig}
                    onClearFilters={handleClearAll}
                />
                {renderContent()}
            </MainContainer>
            
            {/* Botão Flutuante (FAB) */}
            <Link
                to="/statement/new"
                title="Adicionar transação"
                className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
                <Plus size={30} />
            </Link>
        </>
    );
};