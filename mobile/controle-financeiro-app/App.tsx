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
  // Estado para saber se o banco de dados está pronto
  const [dbReady, setDbReady] = useState(false);

  // Efeito para inicializar o banco
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
        // Avise o React que o banco está pronto
        console.log("APP: Banco pronto.");
        setDbReady(true);
      }
    }

    prepareDatabase();
  }, []); // Roda apenas uma vez

  // Callback para esconder a splash DEPOIS que a view for renderizada
  const onLayoutRootView = useCallback(async () => {
    if (dbReady) {
      // Esconda a splash screen
      await SplashScreen.hideAsync();
    }
  }, [dbReady]); // Depende do 'dbReady'

  // Se o banco não estiver pronto, não mostre nada (a splash ainda está visível)
  if (!dbReady) {
    return null;
  }

  // Renderize o app, agora com o 'onLayout' na SafeAreaView
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