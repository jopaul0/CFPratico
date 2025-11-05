// src/screens/StatementScreen.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tx, TransactionGroup } from '../types/Transactions';
import { formatToBRL } from '../utils/Value';

// Componentes
import { MainContainer } from '../components/MainContainer';
import { SearchBar } from '../components/SearchBar';
import { Filters } from '../components/Filters';
import { TransactionItem } from '../components/TransactionItem';
import { Divider } from '../components/Divider';
import { Plus, Trash } from 'lucide-react';

// Hooks
import { useStatementData } from '../hooks/useStatementData';
import { useStatmentMassDelete } from '../hooks/useStatementMassDelete';

// Header da Seção (Recriado do original)
const SectionHeader: React.FC<{ group: TransactionGroup }> = ({ group }) => (
    <div className="pt-4 pb-2 px-4">
        <div className="flex items-center justify-between">
            <h3 className="text-gray-900 font-semibold">{group.dateLabel}</h3>
            <span className="text-gray-500 text-sm">Saldo: {formatToBRL(group.balance)}</span>
        </div>
        <Divider className="my-2 bg-gray-300" />
    </div>
);

export const StatementScreen: React.FC = () => {
    const {
        groups,
        query,
        setQuery,
        filtersConfig,
        handleClearAll,
        doSearch,
        isLoading,
        error,
        reload,
    } = useStatementData();

    const {
        isSelectionMode,
        selectedIds,
        handleLongPressItem,
        handleCancelSelection,
        toggleSelectItem,
        handleDeleteSelected,
    } = useStatmentMassDelete({ reload });

    const navigate = useNavigate();

    const handleAddTransaction = () => navigate('/statement/new');

    // O 'onPress' do item agora só precisa lidar com o modo de seleção,
    // pois a navegação é feita pelo <Link> no próprio componente
    const handlePressItem = (tx: Tx) => {
        if (isSelectionMode) {
            toggleSelectItem(tx.id);
        }
    };
    const onLongPressItem = (txId: string) => {
        handleLongPressItem(txId);
    };

    const ListHeader = (
        <div className="p-4 bg-gray-100 sticky top-0 z-10">
            <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por descrição, valor, categoria…"
                onSubmitSearch={doSearch}
                onClearAll={handleClearAll}
            />

            {isSelectionMode ? (
                <div className="flex items-center justify-between p-3 bg-blue-100 rounded-lg mt-2">
                    <span className="font-semibold text-blue-800">
                        {selectedIds.size} selecionada(s)
                    </span>
                    <button onClick={handleCancelSelection} className="font-semibold text-blue-600">
                        Cancelar
                    </button>
                </div>
            ) : (
                <Filters
                    filters={filtersConfig}
                    onClearFilters={handleClearAll}
                />
            )}
        </div>
    );

    const ListEmpty = (
        <div className="mt-16 text-center">
            {isLoading ? (
                <p>Carregando...</p>
            ) : error ? (
                <p className="text-red-500">Erro: {error.message}</p>
            ) : (
                <p className="text-gray-500">Nenhum dado encontrado.</p>
            )}
        </div>
    );

    return (
        <MainContainer>
            <div className="flex flex-col h-full bg-gray-100">
                {ListHeader}

                <div className="flex-1 overflow-y-auto pb-24">
                    {groups.length > 0 ? (
                        groups.map(group => (
                            <section key={group.dateISO}>
                                <SectionHeader group={group} />
                                <div className="px-4">
                                    {group.transactions.map(item => (
                                        <TransactionItem
                                            key={item.id}
                                            {...item}
                                            onPress={() => handlePressItem(item)}
                                            onLongPress={() => onLongPressItem(item.id)}
                                            isSelected={selectedIds.has(item.id)}
                                            isSelectionMode={isSelectionMode}
                                        />
                                    ))}
                                </div>
                            </section>
                        ))
                    ) : (
                        ListEmpty
                    )}
                </div>

                {/* Botão Flutuante (FAB) Condicional */}
                <button
                    title={isSelectionMode ? "Excluir selecionados" : "Adicionar transação"}
                    onClick={isSelectionMode ? handleDeleteSelected : handleAddTransaction}
                    className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg text-white transition-colors
                            ${isSelectionMode ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isSelectionMode ? <Trash size={30} /> : <Plus size={30} />}
                </button>
            </div>
        </MainContainer>
    );
};