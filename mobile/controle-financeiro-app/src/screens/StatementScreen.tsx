// src/screens/StatementScreen.tsx

import React from 'react';
import { View, ScrollView } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MainContainer } from '../components/MainContainer';
import { SearchBar } from '../components/SearchBar';
import { Filters } from '../components/Filters';
import { TransactionDayGroup } from '../components/TransactionDayGroup';

import type { StatementStackParamList } from '../types/Navigation';
import { useStatementData } from '../hooks/useStatementData'; 


export const StatementScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<StatementStackParamList>>();
    const {
        groups,
        query,
        setQuery,
        filtersConfig,
        handleClearAll,
        doSearch,
    } = useStatementData();

    return (
        <MainContainer>
            {/* Busca (Apenas passa props do hook) */}
            <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por descrição, valor, categoria…"
                onSubmitSearch={doSearch}
                onClearAll={handleClearAll}
            />

            {/* Filtros (Apenas passa a configuração do hook) */}
            <Filters filters={filtersConfig} />

            {/* Lista agrupada */}
            <ScrollView className="mt-2">
                <View className="pb-8">
                    {groups.map((g) => (
                        <TransactionDayGroup
                            key={g.dateISO}
                            date={g.dateLabel}
                            balance={g.balance}
                            transactions={g.transactions}
                            onPressItem={(tx) =>
                                navigation.navigate('TransactionDetail', {
                                    id: tx.id,
                                    category: tx.category,
                                    paymentType: tx.paymentType,
                                    description: tx.description,
                                    value: tx.value,
                                    isNegative: tx.isNegative,
                                    date: tx.date,
                                })
                            }
                        />
                    ))}
                </View>
            </ScrollView>
        </MainContainer>
    );
};