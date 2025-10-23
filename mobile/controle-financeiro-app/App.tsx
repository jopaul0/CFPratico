// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

import { AppNavigator } from './src/navigation/AppNavigator';
import * as DB from './src/services/database';

// Mantenha a tela de Splash visível enquanto o app carrega
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    async function prepareDatabase() {
      try {
        console.log("APP: Inicializando banco de dados...");
        await DB.initDatabase();
        
        console.log("APP: Populando dados iniciais (se necessário)...");
        await DB.seedInitialData();
        
      } catch (e) {
        console.warn("APP: Erro ao preparar o banco:", e);
      } finally {
        console.log("APP: Banco pronto.");
        setDbReady(true);
      }
    }

    prepareDatabase();
  }, []);
  

  const onLayoutRootView = useCallback(async () => {
    if (dbReady) {
      await SplashScreen.hideAsync();
    }
  }, [dbReady]);
  if (!dbReady) {
    return null;
  }


  return (
    <NavigationContainer>
      <View 
        className="flex-1" 
        onLayout={onLayoutRootView}
      > 
        <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
        <AppNavigator />
      </View>
    </NavigationContainer>
  );
}