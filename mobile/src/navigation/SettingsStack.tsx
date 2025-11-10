import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { SettingsStackParamList } from '../types/Navigation';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ManageCategoriesScreen } from '../screens/ManageCategoriesScreen';
import { ManagePaymentMethodsScreen } from '../screens/ManagePaymentMethodsScreen';
import { HelpScreen } from '../screens/HelpScreen';


const Stack = createStackNavigator<SettingsStackParamList>();

export const SettingsStackNavigator: React.FC = () => (
  <Stack.Navigator>

    <Stack.Screen
      name="SettingsMain"
      component={SettingsScreen}
      options={{ title: 'Configurações', headerShown: false }}
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

    <Stack.Screen
      name="Help"
      component={HelpScreen}
      options={{ title: 'Ajuda e FAQ' }}
    />
  </Stack.Navigator>
);