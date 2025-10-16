import React from 'react';
import { View, Text } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { StatementStackParamList } from '../types/Navigation';
import { Car, Utensils, CreditCard, DollarSign, Divide } from 'lucide-react-native';
import { MainContainer } from '../components/MainContainer';
import { Divider } from '../components/Divider';

type DetailRoute = RouteProp<StatementStackParamList, 'TransactionDetail'>;

export const TransactionDetailScreen: React.FC = () => {
  const { params } = useRoute<DetailRoute>();
  const { category, paymentType, description, value, isNegative, date } = params;

  const Icon = category === 'transporte' ? Car
            : category === 'alimentacao' ? Utensils
            : category === 'servico' ? CreditCard
            : DollarSign;

  return (
    <MainContainer title='Detalhes da Transação'>
      <View className="flex-1 bg-white rounded-lg m-4 p-4 shadow">
        <View className="items-center mb-6">
        <View className="p-4 rounded-full bg-gray-800/30 mb-3">
          <Icon size={36} color="#9ca3af" />
        </View>
        <Text className={`text-2xl font-bold ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
          {`${isNegative ? '-' : ''}R$ ${value.toFixed(2).replace('.', ',')}`}
        </Text>
      </View>
      
      <Divider colorClass="bg-gray-200" />

      <View className="p-4 gap-2">
        <Text className="text-black-400 text-xs">Tipo de pagamento</Text>
        <Text className="text-gray-500 mb-3">{paymentType}</Text>

        <Divider colorClass="bg-gray-200" />

        <Text className="text-black-400 text-xs">Descrição</Text>
        <Text className="text-gray-500 mb-3">{description}</Text>

        <Divider colorClass="bg-gray-200" />

        <Text className="text-black-400 text-xs">Data</Text>
        <Text className="text-gray-500">{new Date(date).toLocaleDateString('pt-BR')}</Text>
      </View>
      </View>
    </MainContainer>
  );
};
