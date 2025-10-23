import React, { useCallback } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StatementStackParamList } from '../types/Navigation';

import { useTransactionDetail } from '../hooks/useTransactionDetail';
import { getCategoryIcon } from '../utils/CategoryIcons';
import { formatToBRL } from '../utils/Value';
import { parseStringToDate } from '../utils/Date';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import * as DB from '../services/database';

import { MainContainer } from '../components/MainContainer';
import { Divider } from '../components/Divider';
import { SimpleButton } from '../components/SimpleButton';
import { DatePickerInput } from '../components/DatePickerInput';
import { InputGroup } from '../components/InputGroup';


// 1. O tipo da rota agora só espera o ID
type DetailRoute = RouteProp<StatementStackParamList, 'TransactionDetail'>;

// Componente para o MODO DE VISUALIZAÇÃO
const ViewMode: React.FC<{ tx: DB.TransactionWithNames }> = ({ tx }) => {
    const Icon = getCategoryIcon(tx.category_name || 'Sem Categoria');
    const iconColor = '#9ca3af';
    const formattedValue = formatToBRL(tx.value); // formatToBRL lida com negativo/positivo
    const formattedDate = parseStringToDate(tx.date).toLocaleDateString('pt-BR');

    const paymentConditionText = tx.condition === 'pending' // 'pending' é parcelado
        ? `Parcelado (${tx.installments}x)`
        : 'À Vista';

    const typeText = tx.type === 'expense' ? 'Despesa' : 'Receita';
    const valueColorClass = tx.type === 'expense' ? 'text-red-400' : 'text-green-500';

    return (
        <View className="flex-1 bg-white rounded-lg m-4 p-4 shadow-lg">
            {/* 1. SEÇÃO DE VALOR E ÍCONE */}
            <View className="items-center mb-6">
                <View className="p-4 rounded-full bg-gray-800/30 mb-3">
                    <Icon size={36} color={iconColor} />
                </View>
                <Text className={`text-3xl font-bold ${valueColorClass}`}>
                    {formattedValue}
                </Text>
                <Text className="text-gray-600 font-semibold mt-1">
                    {tx.category_name || 'Sem Categoria'}
                </Text>
            </View>

            <Divider colorClass="bg-gray-200" />

            {/* 2. DETALHES DA MOVIMENTAÇÃO */}
            <View className="p-4 gap-4">
                <View>
                    <Text className="text-gray-500 text-xs font-medium">Tipo de Movimentação</Text>
                    <Text className={`text-base font-semibold ${valueColorClass}`}>
                        {typeText}
                    </Text>
                </View>
                <Divider colorClass="bg-gray-200" />
                <View>
                    <Text className="text-gray-500 text-xs font-medium">Forma de Pagamento</Text>
                    <Text className="text-gray-800 text-base">
                        {tx.payment_method_name || 'N/A'}
                    </Text>
                </View>
                <Divider colorClass="bg-gray-200" />
                <View>
                    <Text className="text-gray-500 text-xs font-medium">Condição</Text>
                    <Text className="text-gray-800 text-base">{paymentConditionText}</Text>
                </View>
                <Divider colorClass="bg-gray-200" />
                <View>
                    <Text className="text-gray-500 text-xs font-medium">Data</Text>
                    <Text className="text-gray-800 text-base">{formattedDate}</Text>
                </View>
                <Divider colorClass="bg-gray-200" />
                <View>
                    <Text className="text-gray-500 text-xs font-medium">Histórico</Text>
                    <Text className="text-gray-800 text-base">{tx.description || '-'}</Text>
                </View>
            </View>
        </View>
    );
};

// Componente para o MODO DE EDIÇÃO
const EditMode: React.FC<{ hook: ReturnType<typeof useTransactionDetail> }> = ({ hook }) => {
    const { formState, setField, categories, paymentMethods } = hook;

    if (!formState) return null; // Segurança, não deve acontecer

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16, paddingTop: 16, paddingHorizontal: 16 }}>

                <DatePickerInput
                    label="Data"
                    value={formState.dateISO}
                    onChange={(v) => setField('dateISO', v)}
                />

                <InputGroup
                    label="Descrição"
                    placeholder="ex.: Venda de serviço"
                    value={formState.description}
                    onChangeText={(v) => setField('description', v)}
                />

                <InputGroup
                    label="Valor"
                    placeholder="ex.: 1.500,00"
                    keyboardType="numeric"
                    value={formState.valueInput}
                    onChangeText={(v) => setField('valueInput', v)}
                />

                <InputGroup
                    label="Tipo"
                    isSelect
                    currentValue={formState.movementType}
                    onValueChange={(v) => setField('movementType', v as any)}
                    options={[
                        { label: 'Receita', value: 'revenue' },
                        { label: 'Despesa', value: 'expense' },
                    ]}
                />

                <InputGroup
                    label="Condição"
                    isSelect
                    currentValue={formState.condition}
                    onValueChange={(v) => setField('condition', v as any)}
                    options={[
                        { label: 'À vista', value: 'paid' },
                        { label: 'Parcelado', value: 'pending' },
                    ]}
                />

                {formState.condition === 'pending' && (
                    <InputGroup
                        label="Parcelas"
                        placeholder="ex.: 3"
                        keyboardType="numeric"
                        value={formState.installments}
                        onChangeText={(v) => setField('installments', v)}
                    />
                )}

                <InputGroup
                    label="Categoria"
                    isSelect
                    currentValue={String(formState.categoryId)}
                    onValueChange={(v) => setField('categoryId', Number(v))}
                    options={categories.map(c => ({ label: c.name, value: String(c.id) }))}
                />

                <InputGroup
                    label="Forma de pagamento"
                    isSelect
                    currentValue={String(formState.paymentMethodId)}
                    onValueChange={(v) => setField('paymentMethodId', Number(v))}
                    options={paymentMethods.map(p => ({ label: p.name, value: String(p.id) }))}
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};


// --- TELA PRINCIPAL ---
export const TransactionDetailScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<StatementStackParamList>>();

    // 1. Pega o ID da rota. (Assume que 'id' é um string)
    const { params } = useRoute<DetailRoute>();
    const txId = parseInt(params.id, 10); // Converte para número

    // 2. Usa o hook
    const hook = useTransactionDetail({ transactionId: txId });
    const {
        isLoading, isSaving, isEditing, error, transaction,
        handleEditToggle, handleCancel, handleSave, handleDelete
    } = hook;

    // 3. Handlers de Ação (com Alertas)
    const onSave = useCallback(async () => {
        try {
            await handleSave();
            Alert.alert('Sucesso', 'Transação atualizada!');
            // O hook já recarrega os dados e sai do modo de edição
        } catch (e: any) {
            Alert.alert('Erro ao Salvar', e?.message ?? 'Falha ao salvar.');
        }
    }, [handleSave]);

    const onDelete = useCallback(async () => {
        Alert.alert(
            "Excluir Transação",
            "Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.",
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await handleDelete();
                            Alert.alert('Sucesso', 'Transação excluída.');
                            navigation.goBack();
                        } catch (e: any) {
                            Alert.alert('Erro ao Excluir', e?.message ?? 'Falha ao excluir.');
                        }
                    }
                }
            ]
        );
    }, [handleDelete, navigation]);

    // --- RENDER ---

    const renderMainContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" className="mt-16" />;
        }
        if (error) {
            return <Text className="mt-16 text-center text-red-500">Erro: {error.message}</Text>;
        }
        if (!transaction) {
            return <Text className="mt-16 text-center text-gray-500">Transação não encontrada.</Text>;
        }

        if (isEditing) {
            return <EditMode hook={hook} />;
        }

        return <ViewMode tx={transaction} />;
    };

    return (
        <MainContainer>
            {renderMainContent()}

            {/* Botões de Ação */}
            {!isLoading && !error && (
                <>
                    <Divider colorClass="bg-gray-300" />
                    <View className="p-2">
                        {isEditing ? (
                            <View className="flex-row justify-center gap-3">

                                <SimpleButton
                                    title="Cancelar"
                                    onPress={handleCancel}
                                    className="bg-gray-50"
                                />
                                <SimpleButton
                                    title={isSaving ? 'Salvando…' : 'Salvar'}
                                    onPress={onSave}
                                    className={isSaving ? 'opacity-60' : ''}
                                    backgroundColor='#3b82f6'
                                    textColor='#fff'
                                />
                            </View>
                        ) : (
                            <View className="flex-row justify-center gap-3">
                                <SimpleButton
                                    title="Excluir"
                                    onPress={onDelete}
                                    backgroundColor='#ef4444'
                                    textColor='#fff'
                                />
                                <SimpleButton
                                    title="Editar"
                                    onPress={handleEditToggle}
                                    className="bg-gray-50"
                                />

                            </View>
                        )}
                    </View>
                </>
            )}
        </MainContainer>
    );
};