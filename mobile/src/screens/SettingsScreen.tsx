// src/screens/SettingsScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../types/Navigation';

import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

import * as DB from '../services/database';

import { useRefresh } from '../contexts/RefreshContext';


import { exportDataAsJson, importDataFromJson } from '../services/dataSync';

import { MainContainer } from '../components/MainContainer';
import { InputGroup } from '../components/InputGroup';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { useSettings } from '../hooks/useSettings';
import { ChevronRight, Database, Wallet, UploadCloud, DownloadCloud, RefreshCw, HelpCircle } from 'lucide-react-native';

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
  const { triggerReload } = useRefresh();
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
      Alert.alert('Erro', 'O compartilhamento de arquivos não está disponível neste dispositivo.');
      return;
    }

    try {
      // --- (INÍCIO DA CORREÇÃO) ---
      // Chama a função importada diretamente (sem 'DB.')
      const jsonString = await exportDataAsJson();
      // --- (FIM DA CORREÇÃO) ---

      const documentsDir = Paths.document;
      const backupFile = new File(documentsDir, 'backup-cfpratico.json');
      await backupFile.write(jsonString, { encoding: 'utf8' });

      await Sharing.shareAsync(backupFile.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Exportar backup de dados (JSON)',
        UTI: 'public.json',
      });

    } catch (e: any) {
      console.error(e);
      Alert.alert('Erro ao Exportar', `Não foi possível gerar o backup: ${e?.message ?? e}`);
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      'Restaurar Dados',
      'ATENÇÃO: Isso limpará TODOS os dados atuais e os substituirá pelo arquivo selecionado. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await DocumentPicker.getDocumentAsync({
                type: ['application/json', 'public.json'],
              });
              if (result.canceled) return;

              const pickedUri = result.assets[0].uri;
              const pickedFile = new File(pickedUri);
              const jsonString = await pickedFile.text();


              await importDataFromJson(jsonString);

              triggerReload();
              Alert.alert('Sucesso!', 'Dados restaurados com sucesso.');

            } catch (e: any) {
              console.error(e);
              Alert.alert('Erro ao Importar', `Não foi possível restaurar o backup: ${e?.message ?? e}`);
            }
          },
        },
      ]
    );
  };

  // Restante do arquivo (handleResetApp, render, etc.) sem alterações...
  const handleResetApp = async () => {
    Alert.alert(
      'Resetar Aplicativo',
      'PERIGO: Isso apagará TODOS os dados e restaurará o aplicativo ao estado inicial. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, Resetar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              // Esta função é do DB, então 'DB.' está correto
              await DB.resetDatabaseToDefaults();

              triggerReload();
              Alert.alert('Aplicativo Resetado', 'Os dados foram restaurados ao padrão.');

            } catch (e: any) {
              console.error(e);
              Alert.alert('Erro no Reset', `Não foi possível resetar o aplicativo: ${e?.message ?? e}`);
            }
          },
        },
      ]
    );
  };

  return (
    <MainContainer
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={reload} colors={['#3b82f6']} />
      }
    >

      {/* Dados da Empresa */}
      <View className="p-4 bg-white rounded-lg shadow mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">Dados da Empresa</Text>

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

      {/* Personalização */}
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

      {/* --- 2. ADICIONAR ESTA SEÇÃO --- */}
      <Text className="text-xl font-bold text-gray-800 mb-4 mt-4">Suporte</Text>

      <NavLink
        title="Ajuda e FAQ"
        description="Tire suas dúvidas sobre o uso do aplicativo."
        icon={<HelpCircle size={22} color="#4b5563" />}
        onPress={() => navigation.navigate('Help')}
      />

      <Divider />

      {/* Backup e Restauração */}
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

      <NavLink
        title="Resetar Aplicativo"
        description="Apaga todos os dados e restaura o app para o padrão de fábrica."
        icon={<RefreshCw size={22} color="#dc2626" />}
        onPress={handleResetApp}
      />
    </MainContainer>
  );
};