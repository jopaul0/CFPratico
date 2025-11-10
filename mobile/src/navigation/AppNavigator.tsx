import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { CustomDrawer } from '../components/CustomDrawer';
import { DrawerParamList } from '../types/Navigation';
import { Platform } from 'react-native';
import { StatementStackNavigator } from './StatementStack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { DashboardStackNavigator } from './DashboardStack';
import { SettingsStackNavigator } from './SettingsStack'; 
import { OnValeScreen } from '../screens/OnValeScreen';


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
        name="Settings"
        component={SettingsStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'SettingsMain';
          const hideHeader = routeName !== 'SettingsMain';

          return {
            title: 'Configurações',
            headerShown: !hideHeader,
          };
        }}
      />

      <AppDrawer.Screen
        name="OnValeContact"
        component={OnValeScreen}
        options={{
          title: 'Sobre a OnVale',
          drawerItemStyle: { display: 'none' },
        }}
      />
    </AppDrawer.Navigator>
  );
};