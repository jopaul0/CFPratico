import React, { useCallback } from 'react';
import { View, ScrollView, Text, ActivityIndicator, TouchableOpacity } from 'react-native'; 

import { useNavigation, useFocusEffect } from '@react-navigation/native'; 
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

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

    const {
        isSelectionMode,
        selectedIds,
        handleLongPressItem,
        handleCancelSelection,
        toggleSelectItem,
        handleDeleteSelected,
    } = useStatmentMassDelete({ reload });

    const navigation = useNavigation<NativeStackNavigationProp<StatementStackParamList>>();

    const handleAddTransaction = useCallback(() => {
        navigation.navigate('AddTransaction' as any);
    }, [navigation]);

    const handlePressItem = useCallback((tx: Tx) => {
        if (isSelectionMode) {
            toggleSelectItem(tx.id);
        } else {
            navigation.navigate('TransactionDetail', {
                id: tx.id,
                category: tx.category,
                paymentType: tx.paymentType,
                description: tx.description,
                value: tx.value,
                isNegative: tx.isNegative,
                date: tx.date,
                type: tx.type,
                condition: tx.condition,
                installments: tx.installments,
            });
        }
    }, [isSelectionMode, navigation, toggleSelectItem]);


    useFocusEffect(
        useCallback(() => {
            console.log("StatementScreen em foco, recarregando dados...");
            reload();
            handleCancelSelection();
        }, [reload, handleCancelSelection]) 
    );

    const renderContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" className="mt-16" />;
        }
        // ... (resto do renderContent: error, lista vazia)
        if (error) { /* ... */ }
        if (groups.length === 0) { /* ... */ }

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
            {/* Busca e Filtros (do hook de dados) */}
            <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por descrição, valor, categoria…"
                onSubmitSearch={doSearch}
                onClearAll={handleClearAll}
            />
            
            {/* Barra de Seleção (do hook de delete) */}
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

            {/* Lista */}
            <ScrollView className="mt-2 flex-1">
                {renderContent()}
            </ScrollView>
        </MainContainer>
    );
};