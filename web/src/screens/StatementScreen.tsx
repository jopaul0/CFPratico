// src/screens/StatementScreen.tsx (Versão Web Corrigida)

import React from 'react';
import { Loader2, Plus, Trash } from 'lucide-react';

// Importando nossos componentes web traduzidos
import { MainContainer } from '../components/MainContainer';
import { SearchBar } from '../components/SearchBar';
import { Filters } from '../components/Filters';
import { TransactionItem } from '../components/TransactionItem';
import { Divider } from '../components/Divider';

// --- MOCK DATA PARA VISUAL ---
const MOCK_FILTERS_STATEMENT = [
    { key: 'dateStart', label: 'Data Inicial', type: 'date', value: '2025-10-01', width: 150 },
    { key: 'dateEnd', label: 'Data Final', type: 'date', value: '2025-10-31', width: 150 },
    // ... (outros filtros)
];
const MOCK_GROUPS = [
    {
        dateISO: '2025-10-25',
        dateLabel: 'sáb, 25/10/2025',
        balance: 5000.00,
        transactions: [
            { id: '1', category: 'Venda de Software', categoryIcon: 'DollarSign', description: 'Licença anual', value: 'R$ 1.500,00', isNegative: false },
        ]
    },
    {
        dateISO: '2025-10-24',
        dateLabel: 'sex, 24/10/2025',
        balance: 3500.00,
        transactions: [
            { id: '2', category: 'Fornecedor', categoryIcon: 'Truck', description: 'Pagamento internet', value: '-R$ 350,50', isNegative: true },
            { id: '3', category: 'Aluguel', categoryIcon: 'LandPlot', description: 'Escritório', value: '-R$ 1.200,00', isNegative: true },
        ]
    }
];
// --- FIM MOCK DATA ---

// Componente de Cabeçalho da Seção (traduzido)
const SectionHeader: React.FC<{ group: any }> = ({ group }) => (
  <div className="bg-gray-100 pt-4 pb-2 px-4 sticky top-0 z-10">
    <div className="flex flex-row items-center justify-between">
      <p className="text-black-100 font-semibold">{group.dateLabel}</p>
      <p className="text-gray-500 text-sm">Saldo: R$ {group.balance.toFixed(2)}</p>
    </div>
    <Divider className="bg-gray-300" marginVertical={8} />
  </div>
);

export const StatementScreen: React.FC = () => {
  const isLoading = false;
  const isSelectionMode = false;
  const selectedIds = new Set();

  // Cabeçalho da Lista (Filtros, etc.)
  const ListHeader = (
    <div className="p-4 bg-gray-100">
      <SearchBar
        value={""}
        placeholder="Buscar por descrição, valor, categoria…"
      />
      
      {isSelectionMode ? (
        <div className="flex flex-row items-center justify-between p-3 bg-blue-100 rounded-lg mt-2">
          <span className="font-semibold text-blue-800">
            {selectedIds.size} selecionada(s)
          </span>
          <button>
            <span className="font-semibold text-blue-600">Cancelar</span>
          </button>
        </div>
      ) : (
        <Filters
          filters={MOCK_FILTERS_STATEMENT}
          onClearFilters={() => {}}
        />
      )}
    </div>
  );

  // Componente para Lista Vazia
  const ListEmpty = (
    <div className="mt-16 items-center text-center">
      {isLoading ? (
        <Loader2 size={32} className="mx-auto animate-spin" />
      ) : (
        <p className="text-center text-gray-500">Nenhum dado encontrado.</p>
      )}
    </div>
  );

  return (
    // --- (INÍCIO DA CORREÇÃO) ---
    // A prop "scrollEnabled" foi removida, pois ela não
    // existe no nosso MainContainer.tsx da web.
    <MainContainer noPadding={true}>
    {/* --- (FIM DA CORREÇÃO) --- */}
      
      {/* Isto substitui o <SectionList> */}
      <div className="flex-1">
        {ListHeader}
        
        {MOCK_GROUPS.length === 0 && !isLoading && ListEmpty}
        {isLoading && MOCK_GROUPS.length === 0 && ListEmpty}

        {MOCK_GROUPS.map(group => (
          <section key={group.dateISO}>
            <SectionHeader group={group} />
            <div className="px-4 bg-gray-100">
              {group.transactions.map((item: any) => (
                <TransactionItem
                  key={item.id}
                  {...item}
                  isSelected={selectedIds.has(item.id)}
                  isSelectionMode={isSelectionMode}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </MainContainer>
  );
};