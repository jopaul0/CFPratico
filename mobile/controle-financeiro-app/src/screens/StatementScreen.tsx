import React, { useCallback } from 'react';
import { View, ScrollView, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native'; 

import { useNavigation } from '@react-navigation/native'; // <--- REMOVIDO 'useFocusEffect'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// ... (outras importações)
import { MainContainer } from '../components/MainContainer';
import { SearchBar } from '../components/SearchBar';
import { Filters } from '../components/Filters';
import { TransactionDayGroup } from '../components/TransactionDayGroup';
import type { StatementStackParamList } from '../types/Navigation';
import type { Tx } from '../types/Transactions';
import { Plus, Trash } from 'lucide-react-native';
import { useStatementData } from '../hooks/useStatementData';
import { useStatmentMassDelete } from '../hooks/useStatmentMassDelete';


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

    // ... (hook useStatmentMassDelete)
    const {
        isSelectionMode,
        selectedIds,
        handleLongPressItem,
        handleCancelSelection,
        toggleSelectItem,
        handleDeleteSelected,
    } = useStatmentMassDelete({ reload });

    const navigation = useNavigation<NativeStackNavigationProp<StatementStackParamList>>();


    // ... (handlers handleAddTransaction, handlePressItem)
    const handleAddTransaction = useCallback(() => {
        navigation.navigate('AddTransaction' as any);
    }, [navigation]);

    const handlePressItem = useCallback((tx: Tx) => {
        if (isSelectionMode) {
            toggleSelectItem(tx.id);
        } else {
            navigation.navigate('TransactionDetail', tx); 
        }
    }, [isSelectionMode, navigation, toggleSelectItem]);


    // --- (BLOCO useFocusEffect REMOVIDO) ---


    // ... (função renderContent permanece igual)
    const renderContent = () => {
        if (isLoading && groups.length === 0) {
            return <ActivityIndicator size="large" className="mt-16" />;
        }
        // ... (resto do renderContent) ...
        if (error) { 
            return <Text className="mt-16 text-center text-red-500">Erro: {error.message}</Text>;
        }
        if (groups.length === 0) {
             return <Text className="mt-16 text-center text-gray-500">Nenhum dado encontrado.</Text>;
        }

        return (
            <View className="pb-8">
                {groups.map((g) => (
                    <TransactionDayGroup
                        key={g.dateISO}
                        date={g.dateLabel}
                        balance={g.balance}
                        transactions={g.transactions}
                       
                        onPressItem={handlePressItem}
                        onLongPressItem={handleLongPressItem}
                        isSelectionMode={isSelectionMode}
                        selectedIds={selectedIds}
                    />
                ))}
            </View>
        );
    }

    return (
        <MainContainer
            // ... (props do MainContainer)
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
            {/* ... (SearchBar e barra de Seleção) */}
             <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por descrição, valor, categoria…"
                onSubmitSearch={doSearch}
                onClearAll={handleClearAll}
            />
            
            {isSelectionMode ? (
                <View className="flex-row items-center justify-between p-3 bg-blue-100 rounded-lg mt-2">
                    {/* ... (conteúdo da barra de seleção) ... */}
                    <Text className="font-semibold text-blue-800">
                        {selectedIds.size} selecionada(s)
                    </Text>
                    <TouchableOpacity onPress={handleCancelSelection}>
                        <Text className="font-semibold text-blue-600">Cancelar</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <Filters filters={filtersConfig} />
            )}


            {/* Lista (Pull-to-Refresh MANTIDO) */}
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
            </ScrollView>
        </MainContainer>
    );
};