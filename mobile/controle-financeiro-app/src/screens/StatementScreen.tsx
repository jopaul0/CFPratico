import React, { useCallback } from 'react'; // << NOVO: Importe o useCallback
import { View, ScrollView, Text, ActivityIndicator } from 'react-native'; // << NOVO: Importe Text e ActivityIndicator

import { useNavigation, useFocusEffect } from '@react-navigation/native'; // << NOVO: Importe o useFocusEffect
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

    // 1. PEGUE OS NOVOS VALORES DO HOOK
    const {
        groups,
        query,
        setQuery,
        filtersConfig,
        handleClearAll,
        doSearch,
        isLoading, // << NOVO
        error,     // << NOVO
        reload,    // << NOVO
    } = useStatementData();

    // 2. ADICIONE O useFocusEffect
    useFocusEffect(
        useCallback(() => {
            // Este código roda toda vez que a tela ganha foco
            console.log("StatementScreen em foco, recarregando dados...");
            reload();
        }, [reload]) // O 'reload' é estável, não causa re-render desnecessário
    );


    const handleAddTransaction = () => {
        navigation.navigate('AddTransaction' as any);
    };

    // 3. CRIE UM COMPONENTE PARA RENDERIZAR O CONTEÚDO
    //    Isso ajuda a lidar com os estados de Loading, Erro e Lista Vazia.
    const renderContent = () => {
        // Estado de Carregamento
        if (isLoading) {
            return <ActivityIndicator size="large" className="mt-16" />;
        }

        // Estado de Erro
        if (error) {
            return (
                <Text className="mt-16 text-center text-red-500">
                    Erro ao carregar dados: {error.message}
                </Text>
            );
        }

        // Estado de Lista Vazia
        if (groups.length === 0) {
            return (
                <Text className="mt-16 text-center text-gray-500">
                    Nenhuma transação encontrada.
                </Text>
            );
        }

        // Estado com Dados (Sucesso)
        return (
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
        );
    }

    return (
        <MainContainer
            hasButton={true}
            iconButton={<Plus size={30} color="white" />}
            onPressButton={handleAddTransaction}
        >
            {/* Busca e Filtros (sempre visíveis) */}
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
                {renderContent()}
            </ScrollView>
        </MainContainer>
    );
};