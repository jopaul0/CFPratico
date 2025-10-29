// src/screens/StatementScreen.tsx
import React, { useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// Tipos corretos para a pilha de Statement
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { StatementStackParamList } from '../types/Navigation'; 

import { MainContainer } from '../components/MainContainer';
import { SearchBar } from '../components/SearchBar';
import { Filters } from '../components/Filters';
import { TransactionDayGroup } from '../components/TransactionDayGroup';

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

    const {
        isSelectionMode,
        selectedIds,
        handleLongPressItem,
        handleCancelSelection,
        toggleSelectItem,
        handleDeleteSelected,
    } = useStatmentMassDelete({ reload });

    // --- CORREÇÃO DE NAVEGAÇÃO ---
    // Este hook (corretamente) usa o tipo da SUA PRÓPRIA pilha
    const navigation = useNavigation<NativeStackNavigationProp<StatementStackParamList>>();

    const handleAddTransaction = useCallback(() => {
        // Navega para 'AddTransaction' DENTRO da StatementStack
        navigation.navigate('AddTransaction');
    }, [navigation]);

    const handlePressItem = useCallback((tx: Tx) => {
        if (isSelectionMode) {
            toggleSelectItem(tx.id);
        } else {
            // Navega para 'TransactionDetail' DENTRO da StatementStack
            navigation.navigate('TransactionDetail', tx);
        }
    }, [isSelectionMode, navigation, toggleSelectItem]);
    // --- FIM DA CORREÇÃO ---


    const renderContent = () => {
        if (isLoading && groups.length === 0) {
            return <ActivityIndicator size="large" className="mt-16" />;
        }
        
        if (error) { 
            return <Text className="mt-16 text-center text-red-500">Erro: {error.message}</Text>;
        }
        if (groups.length === 0) {
             return <Text className="mt-16 text-center text-gray-500">Nenhum dado encontrado.</Text>;
        }

        // Retorna o JSX direto, SEM o ScrollView
        return (
            <View className="pb-8 mt-2">
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
            refreshControl={
                <RefreshControl
                    refreshing={isLoading}
                    onRefresh={reload}
                    colors={['#3b82f6']}
                />
            }
        >
            {/* Busca e Filtros */}
            <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por descrição, valor, categoria…"
                onSubmitSearch={doSearch}
                onClearAll={handleClearAll}
            />
            
            {/* Barra de Seleção */}
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
                <Filters filters={filtersConfig} />
            )}

            {/* Lista (NÃO está mais em um ScrollView) */}
            {renderContent()}

        </MainContainer>
    );
};