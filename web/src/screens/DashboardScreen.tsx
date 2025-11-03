
import React from 'react';
import { Plus, Loader2 } from 'lucide-react';


import { TransactionItem } from '../components/TransactionItem';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { MainContainer } from '../components/MainContainer';
import { Filters } from '../components/Filters';
import { SummaryCard } from '../components/SummaryCard';
import { CategoryChart } from '../components/charts/CategoryChart';
import { TimeChart } from '../components/charts/TimeChart';
import { DashboardExportButton } from '../components/DashboardExportButton';

const MOCK_FILTERS = [
  { key: 'dateStart', label: 'Data Inicial', type: 'date', value: '2025-10-01', width: 150 },
  { key: 'dateEnd', label: 'Data Final', type: 'date', value: '2025-10-31', width: 150 },
  { key: 'movementType', label: 'Tipo', type: 'picker', selectedValue: 'all', options: [{ label: 'Todos', value: 'all' }], width: 140 },
  { key: 'category', label: 'Categoria', type: 'picker', selectedValue: 'all', options: [{ label: 'Todas', value: 'all' }], width: 240 },
];
const MOCK_RECENT_TX = [
  { id: '1', category: 'Venda de Software', categoryIcon: 'DollarSign', description: 'Licença anual', value: 'R$ 1.500,00', isNegative: false },
  { id: '2', category: 'Fornecedor', categoryIcon: 'Truck', description: 'Pagamento internet', value: '-R$ 350,50', isNegative: true },
];
const MOCK_TIME_DATA = [
  { date: '2025-10-01', totalRevenue: 1500, totalExpense: 350.50 },
  { date: '2025-10-02', totalRevenue: 800, totalExpense: 0 },
  { date: '2025-10-03', totalRevenue: 0, totalExpense: 120 },
];
const MOCK_CAT_EXPENSE = [
  { name: 'Fornecedor', total: 350.50, iconName: 'Truck' },
  { name: 'Aluguel', total: 120, iconName: 'LandPlot' },
];
// --- FIM MOCK DATA ---


export const DashboardScreen: React.FC = () => {
  const isLoading = false; // Mude para true para ver o loading

  const renderContent = () => {
    if (isLoading && !MOCK_RECENT_TX.length) {
      return <Loader2 size={32} className="mt-16 mx-auto animate-spin" />;
    }

    return (
      <>
        {/* Cards de Resumo */}
        <div className="flex flex-row flex-wrap mt-4 -mx-2">
          <SummaryCard
            title="Saldo Atual"
            value={'R$ 5.000,00'}
            valueColorClass={'text-blue-600'}
          />
          <SummaryCard
            title="Receitas no Período"
            value={'R$ 2.300,00'}
            valueColorClass="text-emerald-600"
          />
          <SummaryCard
            title="Despesas no Período"
            value={'R$ 470,50'}
            valueColorClass="text-rose-600"
          />
        </div>

        {/* Transações Recentes */}
        <div className="p-4 bg-white rounded-lg shadow mt-4">
          <p className="text-lg font-bold text-gray-800 mb-4">
            Transações Recentes
          </p>
          <div>
            {MOCK_RECENT_TX.map((tx) => (
              <TransactionItem key={tx.id} {...tx} isSelectionMode={false} />
            ))}
            <Divider marginVertical={12} />
            <SimpleButton
              title="Ver todas as transações"
              className="bg-gray-50 w-full"
            />
          </div>
        </div>

        {/* Gráficos */}
        <TimeChart title="Receitas x Despesas por Dia" data={MOCK_TIME_DATA} />
        <CategoryChart
          title="Despesas por Categoria"
          data={MOCK_CAT_EXPENSE}
          colorClass="bg-red-500"
        />
        <CategoryChart
          title="Receitas por Categoria"
          data={[]}
          colorClass="bg-green-500"
        />

        <DashboardExportButton isLoading={false} />
      </>
    );
  };

  return (
    // O <MainContainer> na web é só um wrapper de padding e largura
    <MainContainer>
      {/* Botão flutuante (movido para AppLayout) */}
      <Filters filters={MOCK_FILTERS} onClearFilters={() => {}} />
      {renderContent()}
    </MainContainer>
  );
};