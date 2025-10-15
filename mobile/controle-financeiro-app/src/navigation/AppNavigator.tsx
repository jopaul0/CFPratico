import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HomeScreen } from '../screens/HomeScreen';
import { CustomDrawer } from '../components/CustomDrawer';
import { DrawerParamList, HomeStackParamList } from '../types/Navigation'; 
import { Platform, View, Text } from 'react-native';

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AppDrawer = createDrawerNavigator<DrawerParamList>();

// 1. O Drawer agora mostra o header (para exibir o botão de menu no mobile)
const HomeStackNavigator: React.FC = () => {
  return (
    <HomeStack.Navigator 
      screenOptions={{
        headerShown: false, // Opcional: Se quiser que o Drawer use um header padrão para as telas, defina como 'false' e adicione um botão manual.
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    </HomeStack.Navigator>
  );
};


// 2. App Drawer Navigator (Barra Lateral)
export const AppNavigator: React.FC = () => {
  return (
    <AppDrawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: true, // <--- HABILITA O HEADER AQUI para ter o ícone do Drawer no mobile!
        drawerType: Platform.OS === 'web' ? 'permanent' : 'slide', 
        drawerStyle: {
          width: Platform.OS === 'web' ? 240 : '80%',
        },
      }}
    >
      <AppDrawer.Screen 
        name="Dashboard" 
        component={HomeStackNavigator} 
        options={{ 
            title: '📊 Dashboard',
            // O título será usado no header do Drawer. 
        }} 
      />
      
      <AppDrawer.Screen 
        name="Reports" 
        component={() => <View className="flex-1 items-center justify-center"><Text>Tela de Relatórios Avançados</Text></View>} 
        options={{ title: '📈 Relatórios' }} 
      />
      
    </AppDrawer.Navigator>
  );
};