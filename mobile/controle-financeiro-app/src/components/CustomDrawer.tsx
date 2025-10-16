import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';

// Este componente personaliza o conteúdo da sua barra lateral
export const CustomDrawer: React.FC<DrawerContentComponentProps> = (props) => {
  return (
    <View className="flex-1 bg-white">
      <DrawerContentScrollView {...props}>
        {/* TOPO DO DRAWER: Logo e Título */}
        <View className="p-5 border-b border-gray-100 mb-4">
          <View className="h-10 w-10 bg-gray-700 rounded-full mb-2" /> 
          <Text className="text-xl font-bold text-gray-800">CF Prático</Text>
          <Text className="text-sm text-gray-500">Menu Principal</Text>
        </View>

        <View className="gap-2">
          <DrawerItemList {...props} />
        </View>

      </DrawerContentScrollView>

      {/* RODAPÉ DO DRAWER */}
      <View className="p-5 border-t border-gray-200">
        <Text className="text-xs text-gray-400">Versão Protótipo 1.0</Text>
      </View>
    </View>
  );
};