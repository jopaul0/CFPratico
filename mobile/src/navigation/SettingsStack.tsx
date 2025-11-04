// src/navigation/SettingsStack.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Importa os tipos e as telas
import { SettingsStackParamList } from '../types/Navigation';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ManageCategoriesScreen } from '../screens/ManageCategoriesScreen';
import { ManagePaymentMethodsScreen } from '../screens/ManagePaymentMethodsScreen';

const Stack = createStackNavigator<SettingsStackParamList>();

export const SettingsStackNavigator: React.FC = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="SettingsMain" 
      component={SettingsScreen} 
      options={{ title: 'Configurações', headerShown: false }} // O header será mostrado pelo Drawer
    />
    <Stack.Screen 
      name="ManageCategories" 
      component={ManageCategoriesScreen} 
      options={{ title: 'Gerenciar Categorias' }} 
    />
    <Stack.Screen 
      name="ManagePaymentMethods" 
      component={ManagePaymentMethodsScreen} 
      options={{ title: 'Gerenciar Formas de Pagamento' }} 
    />
  </Stack.Navigator>
);