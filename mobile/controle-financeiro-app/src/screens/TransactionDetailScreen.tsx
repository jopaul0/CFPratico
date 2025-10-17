import React from 'react';
import { View, Text } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { StatementStackParamList } from '../types/Navigation';

// 🚀 Importações dos nossos utilitários e types
import { getCategoryIcon } from '../utils/CategoryIcons'; 
import { formatToBRL } from '../utils/Value';
import { MainContainer } from '../components/MainContainer';
import { Divider } from '../components/Divider';
import { formatDateToString, parseStringToDate } from '../utils/Date'; // Para formatar a data
import type { Tx } from '../types/Transactions'; // Importa o tipo completo da transação

// O tipo DetailRoute agora herda todos os campos do nosso tipo Tx
type DetailRoute = RouteProp<StatementStackParamList, 'TransactionDetail'>;

// O tipo dos params é expandido para incluir todos os campos de Tx
interface DetailParams extends Tx {}


export const TransactionDetailScreen: React.FC = () => {
    // 🚀 O useRoute agora extrai todos os campos da transação (Tx)
    const { params } = useRoute<RouteProp<StatementStackParamList, 'TransactionDetail'>>();
    const { 
        category, 
        paymentType, 
        description, 
        value, 
        isNegative, 
        date, 
        type,           // NOVO
        condition,      // NOVO
        installments,   // NOVO
    } = params as DetailParams; // Faz um cast para garantir todos os campos

    // 🚀 1. Usando o utilitário de ícone
    const Icon = getCategoryIcon(category);
    const iconColor = '#9ca3af';

    // 🚀 2. Usando o utilitário de formatação de valor
    const formattedValue = formatToBRL(value);
    
    // 3. Formatando a data
    const formattedDate = parseStringToDate(date).toLocaleDateString('pt-BR');

    // Monta o texto de condição de pagamento
    const paymentConditionText = condition === 'Parcelado' 
        ? `${condition} (${installments}x)`
        : condition;
    
    // Determina a cor com base no tipo
    const valueColorClass = type === 'Despesa' ? 'text-red-400' : 'text-green-500';

    return (
        <MainContainer>
            <View className="flex-1 bg-white rounded-lg m-4 p-4 shadow-lg">
                
                {/* 1. SEÇÃO DE VALOR E ÍCONE */}
                <View className="items-center mb-6">
                    <View className="p-4 rounded-full bg-gray-800/30 mb-3">
                        <Icon size={36} color={iconColor} />
                    </View>
                    <Text className={`text-3xl font-bold ${valueColorClass}`}>
                        {/* Remove o sinal do valor, pois formatToBRL já cuida disso */}
                        {formattedValue} 
                    </Text>
                    <Text className="text-gray-600 font-semibold mt-1">{category}</Text>
                </View>

                <Divider colorClass="bg-gray-200" />

                {/* 2. DETALHES DA MOVIMENTAÇÃO */}
                <View className="p-4 gap-4">
                    
                    {/* Linha: Tipo de Movimentação */}
                    <View>
                        <Text className="text-gray-500 text-xs font-medium">Tipo de Movimentação</Text>
                        <Text className={`text-base font-semibold ${valueColorClass}`}>
                            {type}
                        </Text>
                    </View>

                    <Divider colorClass="bg-gray-200" />
                    
                    {/* Linha: Forma de Pagamento */}
                    <View>
                        <Text className="text-gray-500 text-xs font-medium">Forma de Pagamento</Text>
                        <Text className="text-gray-800 text-base">{paymentType}</Text>
                    </View>

                    <Divider colorClass="bg-gray-200" />

                    {/* Linha: Condição (À Vista/Parcelado) */}
                    <View>
                        <Text className="text-gray-500 text-xs font-medium">Condição</Text>
                        <Text className="text-gray-800 text-base">{paymentConditionText}</Text>
                    </View>
                    
                    <Divider colorClass="bg-gray-200" />

                    {/* Linha: Data */}
                    <View>
                        <Text className="text-gray-500 text-xs font-medium">Data</Text>
                        <Text className="text-gray-800 text-base">{formattedDate}</Text>
                    </View>
                    
                    <Divider colorClass="bg-gray-200" />

                    {/* Linha: Histórico (Descrição) */}
                    <View>
                        <Text className="text-gray-500 text-xs font-medium">Histórico</Text>
                        <Text className="text-gray-800 text-base">{description}</Text>
                    </View>

                </View>
            </View>
        </MainContainer>
    );
};