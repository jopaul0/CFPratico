import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TransactionDetailScreen } from '../screens/TransactionDetailScreen';
import { AddTransaction } from '../screens/AddTransaction';
import { DashboardStackParamList } from '../types/Navigation';
import { DashboardScreen } from '../screens/DashboardScreen';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export const DashboardStackNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{
        headerBackVisible: true
      }}>
    <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Movimentação', headerShown: false }} />
    <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Detalhe da transação' }} />
    <Stack.Screen name="AddTransaction" component={AddTransaction} options={{ title: 'Adicionar transação' }} />
  </Stack.Navigator>
);
