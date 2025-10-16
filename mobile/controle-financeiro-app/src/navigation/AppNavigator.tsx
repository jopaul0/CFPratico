import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { PrototypeScreen } from '../screens/PrototypeScreen';
import { CustomDrawer } from '../components/CustomDrawer';
import { DrawerParamList } from '../types/Navigation'; 
import { Platform, View, Text } from 'react-native';
import { StatementScreen } from '../screens/StatementScreen';

// const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AppDrawer = createDrawerNavigator<DrawerParamList>();

// // 1. O Drawer agora mostra o header (para exibir o botão de menu no mobile)
// const HomeStackNavigator: React.FC = () => {
//   return (
//     <HomeStack.Navigator 
//       screenOptions={{
//         headerShown: false,
//       }}
//     >
//       <HomeStack.Screen name="HomeMain" component={HomeScreen} />
//     </HomeStack.Navigator>
//   );
// };


// 2. App Drawer Navigator (Barra Lateral)
export const AppNavigator: React.FC = () => {
  return (
    <AppDrawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: Platform.OS!='web', // <--- HABILITA O HEADER AQUI para ter o ícone do Drawer no mobile!
        drawerType: Platform.OS === 'web' ? 'permanent' : 'slide', 
        drawerStyle: {
          width: Platform.OS === 'web' ? 240 : '80%',
        },
      }}
    >
      
      <AppDrawer.Screen 
        name="Statement" 
        component={() => <StatementScreen/>} 
        options={{ title: 'Movimentação' }} 
      />

      <AppDrawer.Screen 
        name="Prototype" 
        component={PrototypeScreen} 
        options={{ 
            title: 'Protótipo',
        }} 
      />
      
    </AppDrawer.Navigator>
  );
};