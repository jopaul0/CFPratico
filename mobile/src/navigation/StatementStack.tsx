import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatementScreen } from '../screens/StatementScreen';
import { TransactionDetailScreen } from '../screens/TransactionDetailScreen';
import { AddTransaction } from '../screens/AddTransaction';
import { StatementStackParamList } from '../types/Navigation';

const Stack = createNativeStackNavigator<StatementStackParamList>();

export const StatementStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{
        headerBackVisible: true
      }}>
    <Stack.Screen name="StatementMain" component={StatementScreen} options={{ title: 'Movimentação', headerShown: false }} />
    <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Detalhe da transação' }} />
    <Stack.Screen name="AddTransaction" component={AddTransaction} options={{ title: 'Adicionar transação' }} />
  </Stack.Navigator>
);
