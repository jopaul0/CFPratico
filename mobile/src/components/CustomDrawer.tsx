// src/components/CustomDrawer.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
// 1. Importar o TIPO LucideIcon
import { LayoutDashboard, List, Settings, ChevronRight, type LucideIcon } from 'lucide-react-native';

// --- Item de Navegação Personalizado ---
interface DrawerNavLinkProps {
  label: string;
  // 2. A prop agora espera o COMPONENTE do ícone, não um elemento
  icon: LucideIcon; 
  onPress: () => void;
  isActive: boolean;
}

const DrawerNavLink: React.FC<DrawerNavLinkProps> = ({ label, icon, onPress, isActive }) => {
  const activeBg = isActive ? 'bg-blue-100' : 'bg-transparent';
  const activeText = isActive ? 'text-blue-700' : 'text-gray-700';
  const activeIcon = isActive ? '#2563eb' : '#4b5563'; // blue-700 / gray-600

  // 3. Renomeamos a prop para 'IconComponent' para usá-la como um componente
  const IconComponent = icon;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center p-3 rounded-lg mx-2 ${activeBg}`}
      activeOpacity={0.7}
    >
      <View className="mr-4">
        {/* 4. Renderizamos o componente diretamente. Sem cloneElement! */}
        <IconComponent color={activeIcon} size={22} />
      </View>
      <Text className={`text-base font-semibold ${activeText} flex-1`}>
        {label}
      </Text>
      <ChevronRight size={18} color="#9ca3af" />
    </TouchableOpacity>
  );
};


// --- Componente Principal do Drawer ---
export const CustomDrawer: React.FC<DrawerContentComponentProps> = (props) => {
  const { state, navigation } = props;
  
  const activeRouteName = state.routes[state.index].name;

  return (
    <View className="flex-1 bg-white">
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* TOPO DO DRAWER: Logo e Título */}
        <View className="p-5 border-b border-gray-100 mb-4 items-center mt-4">
          <Image
            source={require('../assets/icon.png')} //
            resizeMode="contain"
            style={{ width: 70, height: 70 }}
          />
          <Text className="text-xl font-bold text-gray-800 mt-2">CF Prático</Text>
          <Text className="text-sm text-gray-500">Menu Principal</Text>
        </View>

        {/* Lista de Navegação Personalizada */}
        <View className="gap-2">
          <DrawerNavLink
            label="Resumo"
            // 5. Passamos o COMPONENTE, não o elemento
            icon={LayoutDashboard}
            isActive={activeRouteName === 'Dashboard'}
            onPress={() => navigation.navigate('Dashboard')}
          />
          <DrawerNavLink
            label="Movimentação"
            // 5. Passamos o COMPONENTE, não o elemento
            icon={List}
            isActive={activeRouteName === 'Statement'}
            onPress={() => navigation.navigate('Statement')}
          />
          <DrawerNavLink
            label="Configurações"
            // 5. Passamos o COMPONENTE, não o elemento
            icon={Settings}
            isActive={activeRouteName === 'Settings'}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </DrawerContentScrollView>

      {/* RODAPÉ DO DRAWER */}
      <View className="p-5 border-t border-gray-200">
        <Text className="text-xs text-gray-400">Versão Mobile 1.0</Text>
      </View>
    </View>
  );
};