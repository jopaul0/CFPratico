// src/screens/SettingsScreen.tsx
import React from 'react';
import { 
    View, 
    Text, 
    ActivityIndicator, 
    TouchableOpacity, 
    RefreshControl, 
    Alert,
    Platform // 1. Importar Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '../types/Navigation';

// 2. Importar a API de FileSystem completa e AsyncStorage
import { File, Paths, Directory } from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
// ----------------

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

// --- (INÍCIO DA LÓGICA DE DOWNLOAD) ---

// 3. Chave para salvar a URI da pasta no AsyncStorage
const DOWNLOADS_DIR_STORAGE_KEY = '@downloadsDirectoryUri';

/**
 * Salva um arquivo (em string) publicamente no Android
 * usando a API moderna de FileSystem (SDK 51+).
 * Lembra a pasta escolhida pelo usuário.
 */
const saveToDownloadsAndroid = async (
  filename: string, 
  content: string, // <-- Alterado de base64Content para content
  mimeType: string
) => {
  if (Platform.OS !== 'android') {
    return; // Apenas para Android
  }

  // Função interna para realmente salvar o arquivo
  const trySave = async (dir: Directory) => {
    // Tenta criar (ou sobrescrever) o arquivo
    const safFile = dir.createFile(filename, mimeType); //
    // Escreve o conteúdo com encoding UTF-8
    safFile.write(content, { encoding: 'utf8' }); //
    Alert.alert('Sucesso', `Arquivo salvo em Downloads!\n(${filename})`);
  };

  // Função para pedir ao usuário, salvar a URI e então salvar o arquivo
  const askAndSave = async () => {
    Alert.alert(
      'Salvar em Downloads',
      'Por favor, selecione sua pasta "Downloads" para salvar os relatórios. O app lembrará desta pasta para o futuro.'
    );
    
    // 1. Pede ao usuário para escolher (retorna o tipo base com a URI)
    const pickedDirResult = await Directory.pickDirectoryAsync(); //
    
    // 2. Cria uma *instância da classe* Directory a partir da URI (corrige o erro de tipo)
    const pickedDir = new Directory(pickedDirResult.uri); //

    // 3. Salva a URI da pasta para uso futuro
    await AsyncStorage.setItem(DOWNLOADS_DIR_STORAGE_KEY, pickedDir.uri);
    
    // 4. Tenta salvar na pasta recém-escolhida
    await trySave(pickedDir);
  };

  try {
    // 1. Tenta carregar uma URI de pasta já salva
    const savedUri = await AsyncStorage.getItem(DOWNLOADS_DIR_STORAGE_KEY);
    
    if (!savedUri) {
      // Se NUNCA salvamos antes, pede ao usuário
      await askAndSave();
    } else {
      // Se JÁ temos uma URI, tentamos usá-la
      const downloadsDir = new Directory(savedUri); //
      try {
        // Tenta salvar diretamente
        await trySave(downloadsDir);
      } catch (permissionError: any) {
        // FALHOU! Provavelmente a permissão expirou
        console.warn('Falha ao usar URI salva, pedindo novamente:', permissionError.message);
        await AsyncStorage.removeItem(DOWNLOADS_DIR_STORAGE_KEY);
        await askAndSave();
      }
    }
  } catch (e: any) {
    // Pega erros do 'pickDirectoryAsync' (como o usuário cancelar)
    if (e.code === 'PickerCancelledException' || e.code === 'ERR_PICKER_CANCELLED' || e.message?.includes('cancelled')) { //
      console.log("Usuário cancelou a seleção de diretório.");
    } else {
      console.error('Erro ao salvar em Downloads (Android):', e);
      Alert.alert('Erro ao Salvar', 'Não foi possível salvar em Downloads. Você ainda pode salvar pela tela de compartilhamento.');
    }
  }
};
// --- (FIM DA LÓGICA DE DOWNLOAD) ---


const NavLink: React.FC<{ title: string; description: string; onPress: () => void; icon: React.ReactNode; }> =
  ({ title, description, onPress, icon }) => (
    // ... (Componente NavLink não muda) ...
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
    // 4. Usar o setter com máscara que criamos
    setInitialBalanceInput: handleBalanceInputChange,
    handleSave,
    reload,
  } = useSettings(); //

  const handleExportData = async () => {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Erro', 'O compartilhamento de arquivos não está disponível neste dispositivo.');
      return;
    }

    try {
      // 1. Gera o JSON (string)
      const jsonString = await exportDataAsJson(); //
      const filename = 'backup-cfpratico.json';
      const mimeType = 'application/json';

      // 2. Tenta salvar em "Downloads" (Android)
      // Esta função agora usa o 'content' como string utf8
      await saveToDownloadsAndroid(filename, jsonString, mimeType);

      // 3. Salva no cache INTERNO para o Sharing (todas as plataformas)
      const cacheFile = new File(Paths.cache, filename); //
      cacheFile.write(jsonString, { encoding: 'utf8' }); //

      // 4. Abre o menu de compartilhamento
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
    // ... (Função handleImportData não muda) ...
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
              // Usamos a API 'File' para ler o arquivo pego pelo DocumentPicker
              const pickedFile = new File(pickedUri); //
              const jsonString = await pickedFile.text(); //

              await importDataFromJson(jsonString); //

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
    // ... (Função handleResetApp não muda) ...
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
              await DB.resetDatabaseToDefaults(); //
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
              // 5. Conecta o setter com máscara
              onChangeText={handleBalanceInputChange} 
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