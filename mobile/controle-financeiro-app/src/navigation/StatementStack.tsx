import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatementScreen } from '../screens/StatementScreen';
import { TransactionDetailScreen } from '../screens/TransactionDetailScreen';
import { StatementStackParamList } from '../types/Navigation';

const Stack = createNativeStackNavigator<StatementStackParamList>();

export const StatementStackNavigator: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen name="StatementMain" component={StatementScreen} options={{ title: 'Movimentação' }} />
    <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} options={{ title: 'Detalhe da transação' }} />
  </Stack.Navigator>
);
