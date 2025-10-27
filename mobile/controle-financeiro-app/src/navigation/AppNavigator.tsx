import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { PrototypeScreen } from '../screens/PrototypeScreen';
import { CustomDrawer } from '../components/CustomDrawer';
import { DrawerParamList } from '../types/Navigation';
import { Platform } from 'react-native';
import { StatementStackNavigator } from './StatementStack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import AdminScreen from '../screens/AdminScreen';
import { ManagePaymentMethodsScreen } from '../screens/ManagePaymentMethodsScreen';
import { ManageCategoriesScreen } from '../screens/ManageCategoriesScreen';
import { DashboardStackNavigator } from './DashboardStack';



const AppDrawer = createDrawerNavigator<DrawerParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <AppDrawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: Platform.OS != 'web',
        drawerType: Platform.OS === 'web' ? 'permanent' : 'slide',
        drawerStyle: {
          width: Platform.OS === 'web' ? 240 : '80%',
        }
      }}
    >

      <AppDrawer.Screen
        name="Dashboard"
        component={DashboardStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'DashboardMain';
          const hideHeader = routeName !== 'DashboardMain';

          return {
            title: 'Resumo',
            headerShown: !hideHeader,
          };
        }}
      />

      <AppDrawer.Screen
        name="Statement"
        component={StatementStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'StatementMain';
          const hideHeader = routeName !== 'StatementMain';

          return {
            title: 'Movimentação',
            headerShown: !hideHeader,
          };
        }}
      />

      <AppDrawer.Screen
        name="ManageCategories"
        component={ManageCategoriesScreen}
        options={{
          title: 'Categorias',
        }}
      />

      <AppDrawer.Screen
        name="ManagePaymentMethods"
        component={ManagePaymentMethodsScreen}
        options={{
          title: 'Formas de Pagamento',
        }}
      />

      <AppDrawer.Screen
        name="Prototype"
        component={PrototypeScreen}
        options={{
          title: 'Protótipo',
        }}
      />

      <AppDrawer.Screen
        name="Test"
        component={AdminScreen}
        options={{
          title: 'Teste',
        }}
      />

    </AppDrawer.Navigator>
  );
};