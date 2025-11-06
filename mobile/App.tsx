import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { RefreshProvider } from './src/contexts/RefreshContext';
import * as DB from './src/services/database';

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
      <SafeAreaView
        className="flex-1"
        onLayout={onLayoutRootView}
      >
        <StatusBar barStyle="dark-content" backgroundColor="transparent" 
            translucent={true} />
        <RefreshProvider><AppNavigator /></RefreshProvider>
      </SafeAreaView>
    </NavigationContainer>
  );
}
