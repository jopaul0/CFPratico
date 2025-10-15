// App.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';

import { AppNavigator } from './src/navigation/AppNavigator';


export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView className="flex-1 bg-gray-50"> 
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </SafeAreaView>
    </NavigationContainer>
  );
}