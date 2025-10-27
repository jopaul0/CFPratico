// src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../types/Navigation';

import { MainContainer } from '../components/MainContainer';
import { InputGroup } from '../components/InputGroup';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { useSettings } from '../hooks/useSettings';
import { ChevronRight, Database, Wallet } from 'lucide-react-native';

// Um componente de link de navegação simples
const NavLink: React.FC<{ title: string; description: string; onPress: () => void; icon: React.ReactNode; }> = 
  ({ title, description, onPress, icon }) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center p-4 bg-white rounded-lg mb-3 shadow"
    activeOpacity={0.7}
  >
    <View className="mr-4 p-2 bg-gray-100 rounded-full">
      {icon}
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-800">{title}</Text>
      <Text className="text-sm text-gray-500">{description}</Text>
    </View>
    <ChevronRight size={20} color="#9ca3af" />
  </TouchableOpacity>
);


export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList>>();
  const {
    isLoading,
    isSaving,
    error,
    companyName,
    setCompanyName,
    initialBalanceInput,
    setInitialBalanceInput,
    handleSave,
    reload,
  } = useSettings();

  return (
    <MainContainer
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={reload}
          colors={['#3b82f6']}
        />
      }
    >
      <Text className="text-2xl font-bold text-gray-800 mb-6">Configurações</Text>

      {/* Seção Dados da Empresa */}
      <View className="p-4 bg-white rounded-lg shadow mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">
          Dados da Empresa
        </Text>
        
        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <>
            <InputGroup
              label="Nome da Empresa"
              placeholder="Minha Empresa LTDA"
              value={companyName}
              onChangeText={setCompanyName}
            />
            <InputGroup
              label="Saldo Inicial"
              placeholder="0,00"
              keyboardType="numeric"
              value={initialBalanceInput}
              onChangeText={setInitialBalanceInput}
            />
            <SimpleButton
              title={isSaving ? 'Salvando...' : 'Salvar Dados'}
              onPress={handleSave}
              backgroundColor="#3b82f6"
              textColor="#ffffff"
              activeBackgroundColor="#2563eb"
              disabled={isSaving}
            />
          </>
        )}
      </View>

      <Divider />

      {/* Seção Personalização (Links) */}
      <Text className="text-xl font-bold text-gray-800 mb-4 mt-4">Personalização</Text>
      
      <NavLink
        title="Gerenciar Categorias"
        description="Adicione, edite ou remova categorias de transação."
        icon={<Database size={22} color="#4b5563" />}
        onPress={() => navigation.navigate('ManageCategories')}
      />

      <NavLink
        title="Gerenciar Formas de Pagamento"
        description="Adicione, edite ou remova formas de pagamento."
        icon={<Wallet size={22} color="#4b5563" />}
        onPress={() => navigation.navigate('ManagePaymentMethods')}
      />
      
      {error && (
        <Text className="text-red-500 text-center mt-4">Erro: {error.message}</Text>
      )}
    </MainContainer>
  );
};