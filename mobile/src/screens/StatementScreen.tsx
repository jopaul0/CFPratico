// src/screens/StatementScreen.tsx
import React, { useCallback, useMemo } from 'react';
import { 
    View, 
    Text, 
    ActivityIndicator, 
    TouchableOpacity, 
    RefreshControl,
    SectionList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StatementStackParamList } from '../types/Navigation'; 

// Componentes
import { MainContainer } from '../components/MainContainer';
import { SearchBar } from '../components/SearchBar';
import { Filters } from '../components/Filters';
import { TransactionItem } from '../components/TransactionItem';
import { Divider } from '../components/Divider';

import type { Tx, TransactionGroup } from '../types/Transactions';
import { Plus, Trash } from 'lucide-react-native';
import { formatToBRL } from '../utils/Value';

import { useStatementData } from '../hooks/useStatementData';
import { useStatmentMassDelete } from '../hooks/useStatmentMassDelete';


// Componente de Cabeçalho da Seção (sem alteração)
const SectionHeader: React.FC<{ group: TransactionGroup }> = ({ group }) => (
  <View className="bg-gray-100 pt-4 pb-2 px-4"> 
    <View className="flex-row items-center justify-between">
      <Text className="text-black-100 font-semibold">{group.dateLabel}</Text>
      <Text className="text-gray-500 text-sm">Saldo: {formatToBRL(group.balance)}</Text>
    </View>
    <Divider colorClass="bg-gray-300" marginVertical={8} />
  </View>
);


export const StatementScreen: React.FC = () => {
    const {
        groups,
        query,
        setQuery,
        filtersConfig,
        handleClearAll, // <-- Esta função já existia
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

    const navigation = useNavigation<NativeStackNavigationProp<StatementStackParamList>>();

    // ... (Handlers de navegação e item (handlePressItem, etc) não mudam) ...
    const handleAddTransaction = useCallback(() => {
        navigation.navigate('AddTransaction');
    }, [navigation]);
    const handlePressItem = useCallback((tx: Tx) => {
        if (isSelectionMode) {
            toggleSelectItem(tx.id);
        } else {
            navigation.navigate('TransactionDetail', tx);
        }
    }, [isSelectionMode, navigation, toggleSelectItem]);
    const onLongPressItem = useCallback((txId: string) => {
        handleLongPressItem(txId);
    }, [handleLongPressItem]);

    // ... (sections e renderTransactionItem não mudam) ...
    const sections = useMemo(() => {
        return groups.map(group => ({
            ...group, // Copia dateISO, dateLabel, balance
            data: group.transactions, // Mapeia 'transactions' para 'data'
        }));
    }, [groups]);
    const renderTransactionItem = ({ item }: { item: Tx }) => (
        <View className="px-4 bg-gray-100"> 
            <TransactionItem
              {...item}
              onPress={() => handlePressItem(item)}
              onLongPress={() => onLongPressItem(item.id)}
              isSelected={selectedIds.has(item.id)}
              isSelectionMode={isSelectionMode}
            />
        </View>
    );

    // --- (ATUALIZADO) ---
    // Componente de Cabeçalho da Lista (Filtros, etc.)
    const ListHeader = (
        <View className="p-4 bg-gray-100"> 
            <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por descrição, valor, categoria…"
                onSubmitSearch={doSearch}
                onClearAll={handleClearAll} // <-- Limpa a barra de busca
            />
            
            {isSelectionMode ? (
                <View className="flex-row items-center justify-between p-3 bg-blue-100 rounded-lg mt-2">
                    <Text className="font-semibold text-blue-800">
                        {selectedIds.size} selecionada(s)
                    </Text>
                    <TouchableOpacity onPress={handleCancelSelection}>
                        <Text className="font-semibold text-blue-600">Cancelar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Filters 
                    filters={filtersConfig} 
                    onClearFilters={handleClearAll} // <-- Passa a função de limpar
                />
            )}
        </View>
    );
    // --- (FIM DA ATUALIZAÇÃO) ---

    // Componente para Lista Vazia (sem alteração)
    const ListEmpty = (
        <View className="mt-16 items-center">
            {isLoading && groups.length === 0 ? (
                <ActivityIndicator size="large" />
            ) : error ? (
                <Text className="text-center text-red-500">Erro: {error.message}</Text>
            ) : (
                <Text className="text-center text-gray-500">Nenhum dado encontrado.</Text>
            )}
        </View>
    );

    return (
        <MainContainer
            scrollEnabled={false}
            noPadding={true}
            hasButton={true}
            colorButton={ isSelectionMode ? '#ef4444' : '#3b82f6' }
            iconButton={
                isSelectionMode 
                    ? <Trash size={30} color="white" /> 
                    : <Plus size={30} color="white" />
            }
            onPressButton={
                isSelectionMode
                    ? handleDeleteSelected
                    : handleAddTransaction
            }
        >
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderTransactionItem}
                renderSectionHeader={({ section }) => <SectionHeader group={section as TransactionGroup} />}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={ListEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={reload}
                        colors={['#3b82f6']}
                        tintColor={'#3b82f6'} // para iOS
                    />
                }
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                stickySectionHeadersEnabled={false}
                contentContainerStyle={{ paddingBottom: 96 }} // Espaço para o botão flutuante
                className="bg-gray-100"
            />
        </MainContainer>
    );
};