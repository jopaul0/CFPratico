import React, { useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../types/Navigation';

import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon, X } from 'lucide-react-native';

import { File, Paths, Directory } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const MAX_LOGO_SIZE_BYTES = 500 * 1024;
const DOWNLOADS_DIR_STORAGE_KEY = '@downloadsDirectoryUri';

const saveToDownloadsAndroid = async (
  filename: string,
  content: string,
  mimeType: string
) => {
  if (Platform.OS !== 'android') return;
  const trySave = async (dir: Directory) => {
    const safFile = dir.createFile(filename, mimeType);
    safFile.write(content, { encoding: 'utf8' });
    Alert.alert('Sucesso', `Arquivo salvo em Downloads!\n(${filename})`);
  };
  const askAndSave = async () => {
    Alert.alert(
      'Salvar em Downloads',
      'Por favor, selecione sua pasta "Downloads" para salvar os relatórios. O app lembrará desta pasta para o futuro.'
    );
    const pickedDirResult = await Directory.pickDirectoryAsync();
    const pickedDir = new Directory(pickedDirResult.uri);
    await AsyncStorage.setItem(DOWNLOADS_DIR_STORAGE_KEY, pickedDir.uri);
    await trySave(pickedDir);
  };
  try {
    const savedUri = await AsyncStorage.getItem(DOWNLOADS_DIR_STORAGE_KEY);
    if (!savedUri) {
      await askAndSave();
    } else {
      const downloadsDir = new Directory(savedUri);
      try {
        await trySave(downloadsDir);
      } catch (permissionError: any) {
        console.warn('Falha ao usar URI salva, pedindo novamente:', permissionError.message);
        await AsyncStorage.removeItem(DOWNLOADS_DIR_STORAGE_KEY);
        await askAndSave();
      }
    }
  } catch (e: any) {
    if (e.code === 'PickerCancelledException' || e.code === 'ERR_PICKER_CANCELLED' || e.message?.includes('cancelled')) {
      console.log("Usuário cancelou a seleção de diretório.");
    } else {
      console.error('Erro ao salvar em Downloads (Android):', e);
      Alert.alert('Erro ao Salvar', 'Não foi possível salvar em Downloads. Você ainda pode salvar pela tela de compartilhamento.');
    }
  }
};
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
    setInitialBalanceInput: handleBalanceInputChange,
    initialBalanceSign,
    setInitialBalanceSign,
    companyLogo,
    setCompanyLogo,
    handleSave,
    reload,
  } = useSettings();

  const handleLogoPick = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão Necessária', 'Precisamos de acesso à sua galeria para selecionar uma logo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];

    if (!asset.base64) {
      Alert.alert('Erro', 'Não foi possível ler a imagem selecionada (base64).');
      return;
    }

    const base64 = asset.base64;

    const fileSize = (base64.length * 0.75);
    if (fileSize > MAX_LOGO_SIZE_BYTES) {
      Alert.alert('Erro', `A imagem é muito grande. O limite é ${MAX_LOGO_SIZE_BYTES / 1024}KB.`);
      return;
    }

    const mimeType = asset.mimeType || (asset.uri.endsWith('.png') ? 'image/png' : 'image/jpeg');
    setCompanyLogo(`data:${mimeType};base64,${base64}`);

  }, [setCompanyLogo]);

  const handleExportData = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Erro', 'O compartilhamento de arquivos não está disponível neste dispositivo.');
      return;
    }
    try {
      const jsonString = await exportDataAsJson();
      const filename = 'backup-cfpratico.json';
      const mimeType = 'application/json';
      await saveToDownloadsAndroid(filename, jsonString, mimeType);
      const cacheFile = new File(Paths.cache, filename);
      cacheFile.write(jsonString, { encoding: 'utf8' });
      await Sharing.shareAsync(cacheFile.uri, {
        mimeType: mimeType,
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

  const toggleSign = () => {
    setInitialBalanceSign(prev => (prev === 'positive' ? 'negative' : 'positive'));
  };

  const isNegative = initialBalanceSign === 'negative';

  return (
    <MainContainer
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={reload} colors={['#3b82f6']} />
      }
    >
      {/* Dados da Empresa (JSX sem alterações) */}
      <View className="p-4 bg-white rounded-lg shadow mb-6">
        <Text className="text-lg font-semibold text-gray-700 mb-3">Dados da Empresa</Text>

        {isLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <>
            <View className="mb-4">
              <Text className="block text-sm font-medium text-gray-700 mb-2">
                Logo da Empresa
              </Text>
              <View className="flex-row items-center gap-4">
                <View className="w-20 h-20 rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {companyLogo ? (
                    <Image source={{ uri: companyLogo }} className="w-full h-full" resizeMode="contain" />
                  ) : (
                    <ImageIcon size={32} color="#9ca3af" />
                  )}
                </View>
                <View className="flex-col gap-2">
                  <SimpleButton
                    title="Alterar Logo"
                    onPress={handleLogoPick}
                  />
                  {companyLogo && (
                    <SimpleButton
                      title="Remover"
                      onPress={() => setCompanyLogo(null)}
                      backgroundColor="#fef2f2"
                      textColor="#ef4444"
                      activeBackgroundColor="#fee2e2"
                    />
                  )}
                </View>
              </View>
            </View>

            <InputGroup
              label="Nome da Empresa"
              placeholder="Minha Empresa LTDA"
              value={companyName}
              onChangeText={setCompanyName}
            />

  {/* --- GRUPO DE SALDO INICIAL ATUALIZADO --- */ }
  <View className="mb-3">
    <Text className="block text-sm font-medium text-gray-700 mb-1">
      Saldo Inicial
    </Text>


    <View className="flex-row items-center gap-2">
      {/* Input (agora dentro do flex) */}
      <View className="flex-1">
        <InputGroup
          label="" // Label já está acima
          placeholder="0,00"
          keyboardType="numeric"
          value={initialBalanceInput}
          onChangeText={handleBalanceInputChange}
        />
      </View>

      {/* Botão de Sinal */}
      <TouchableOpacity
        onPress={toggleSign}
        className={`
                    w-14 rounded-lg border justify-center mt-3 items-center
                    ${isNegative
            ? 'bg-red-100 border-red-300'
            : 'bg-green-100 border-green-300'
          }
                  `}
        style={{ height: Platform.OS === 'android' ? 52 : 44 }}
        activeOpacity={0.7}
      >
        <Text className={`
                    font-semibold text-lg
                    ${isNegative ? 'text-red-700' : 'text-green-700'}
                  `}>
          {isNegative ? '−' : '+'}
        </Text>
      </TouchableOpacity>


    </View>
  </View>
  {/* --- FIM DO GRUPO --- */ }

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
      </View >

  <Divider />

{/* Personalização (JSX sem alterações) */ }
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

{/* Suporte (JSX sem alterações) */ }
      <Text className="text-xl font-bold text-gray-800 mb-4 mt-4">Suporte</Text>
      <NavLink
        title="Ajuda e FAQ"
        description="Tire suas dúvidas sobre o uso do aplicativo."
        icon={<HelpCircle size={22} color="#4b5563" />}
        onPress={() => navigation.navigate('Help')}
      />

      <Divider />

{/* Backup e Restauração (JSX sem alterações) */ }
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
    </MainContainer >
  );
};