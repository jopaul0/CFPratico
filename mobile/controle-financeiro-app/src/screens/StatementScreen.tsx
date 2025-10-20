import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MainContainer } from '../components/MainContainer';
import { SearchBar } from '../components/SearchBar';
import { Filters } from '../components/Filters';
import { TransactionDayGroup } from '../components/TransactionDayGroup';

import type { StatementStackParamList } from '../types/Navigation';
import { useStatementData } from '../hooks/useStatementData';

// 🚀 Importando o ícone Plus
import { Plus } from 'lucide-react-native';


export const StatementScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<StatementStackParamList>>();
    
    const {
        groups,
        query,
        setQuery,
        filtersConfig,
        handleClearAll,
        doSearch,
    } = useStatementData();""

    const handleAddTransaction = () => {
        navigation.navigate('AddTransaction' as any); 
    };

    return (
        // O MainContainer precisa envolver tudo para que o FAB seja posicionado corretamente
        <MainContainer hasButton={true} iconButton={<Plus size={30} color="white" />} onPressButton={handleAddTransaction}>
            {/* Busca e Filtros */}
            <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar por descrição, valor, categoria…"
                onSubmitSearch={doSearch}
                onClearAll={handleClearAll}
            />
            <Filters filters={filtersConfig} />

            {/* Lista agrupada (Scrollable Content) */}
            <ScrollView className="mt-2 flex-1">
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
                                    type: tx.type, 
                                    condition: tx.condition,
                                    installments: tx.installments,
                                })
                            }
                        />
                    ))}
                </View>
            </ScrollView>


            

        </MainContainer>
    );
};