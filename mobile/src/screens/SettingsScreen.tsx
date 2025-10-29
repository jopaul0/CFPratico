// src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../types/Navigation';

import * as FileSystem from 'expo-file-system'; 
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as Updates from 'expo-updates';

import * as DB from '../services/database';

import { MainContainer } from '../components/MainContainer';
import { InputGroup } from '../components/InputGroup';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { useSettings } from '../hooks/useSettings';
import { ChevronRight, Database, Wallet, UploadCloud, DownloadCloud, RefreshCw } from 'lucide-react-native';

// Componente NavLink (sem alteração)
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

  const handleExportData = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Erro', 'O compartilhamento de arquivos não está disponível.');
      return;
    }
    
    try {
      const jsonString = await DB.exportDataAsJson();
      
      // --- (CORREÇÃO: Remova o '(as any)') ---
      // Acessa a propriedade diretamente.
      const docDir = FileSystem.documentDirectory; 
      
      if (!docDir) {
        // Se ele ainda falhar aqui, o problema é 100% a instalação da biblioteca
        throw new Error("Não foi possível encontrar o diretório de arquivos (FileSystem.documentDirectory está nulo).");
      }
      
      const backupFileUri = `${docDir}backup-cfpratico.json`;

      // 2. Salvar o JSON (Use FileSystem.writeAsStringAsync, que está correto)
      await FileSystem.writeAsStringAsync(backupFileUri, jsonString);

      // 3. Compartilhar o arquivo .json
      await Sharing.shareAsync(backupFileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Exportar backup de dados (JSON)',
        UTI: 'public.json',
      });
      
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erro ao Exportar', 'Não foi possível gerar o backup: ' + e.message);
    }
  };

  // --- (MODIFICADO: Função de Importar Corrigida) ---
  const handleImportData = async () => {
    Alert.alert(
      "Restaurar Dados",
      "ATENÇÃO: Isso limpará TODAS as transações, categorias e métodos de pagamento atuais e os substituirá pelos dados do arquivo. Deseja continuar?",
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            try {
              // 1. Pedir ao usuário para selecionar o arquivo .json
              const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', 'public.json'],
              });

              if (result.canceled) return;
              
              const pickedFileUri = result.assets[0].uri;

              // 2. Ler o conteúdo do arquivo (padrão é UTF8)
              const jsonString = await FileSystem.readAsStringAsync(pickedFileUri);

              // 3. Chamar o serviço de importação
              await DB.importDataFromJson(jsonString);

              // 4. Forçar o RECARREGAMENTO COMPLETO do aplicativo
              Alert.alert(
                'Sucesso!',
                'Dados restaurados. O aplicativo será reiniciado agora.',
                [{ text: 'OK', onPress: () => Updates.reloadAsync() }]
              );

            } catch (e: any) {
              console.error(e);
              Alert.alert('Erro ao Importar', 'Não foi possível restaurar o backup: ' + e.message);
            }
          }
        }
      ]
    );
  };
  
  // --- (Função de Resetar - Sem alteração) ---
  const handleResetApp = async () => {
    Alert.alert(
      "Resetar Aplicativo",
      "PERIGO: Você tem certeza? Isso apagará TODOS os dados (transações, categorias, métodos, configurações) e restaurará o aplicativo ao estado inicial de fábrica. Esta ação não pode ser desfeita.",
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, Resetar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await DB.resetDatabaseToDefaults();
              Alert.alert(
                'Aplicativo Resetado',
                'O aplicativo foi restaurado aos padrões de fábrica e será reiniciado agora.',
                [{ text: 'OK', onPress: () => Updates.reloadAsync() }]
              );
            } catch (e: any)
{
              console.error(e);
              Alert.alert('Erro no Reset', 'Não foi possível resetar o aplicativo: ' + e.message);
            }
          }
        }
      ]
    );
  };

  // --- (Render JSX - Sem alteração) ---
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
      
      <Divider />
      
      {/* Seção de Backup */}
      <Text className="text-xl font-bold text-gray-800 mb-4 mt-4">Backup e Restauração de Dados</Text>

      <NavLink
        title="Exportar Dados"
        description="Salva um arquivo (.json) com suas transações, categorias e métodos."
        icon={<UploadCloud size={22} color="#059669" />}
        onPress={handleExportData}
      />

      <NavLink
        title="Importar (Restaurar) Dados"
        description="Substitui os dados atuais por um arquivo de backup (.json)."
        icon={<DownloadCloud size={22} color="#ca8a04" />} 
        onPress={handleImportData}
      />
      
      <Divider />
      
      {/* Seção de Reset */}
      <Text className="text-xl font-bold text-gray-800 mb-4 mt-4">Zona de Perigo</Text>
      
      <NavLink
        title="Resetar Aplicativo"
        description="Apaga todos os dados e restaura o app para o padrão de fábrica."
        icon={<RefreshCw size={22} color="#dc2626" />} 
        onPress={handleResetApp}
      />
      
    </MainContainer>
  );
};