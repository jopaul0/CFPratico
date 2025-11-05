// src/screens/SettingsScreen.tsx
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import * as DB from '../services/database';
import { useRefresh } from '../contexts/RefreshContext';
import { exportDataAsJson, importDataFromJson } from '../services/dataSync';

import { MainContainer } from '../components/MainContainer';
import { InputGroup } from '../components/InputGroup';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { useSettings } from '../hooks/useSettings';
import { ChevronRight, Database, Wallet, UploadCloud, DownloadCloud, RefreshCw, HelpCircle } from 'lucide-react';

// NavLink (recriado do seu original)
const NavLink: React.FC<{ title: string; description: string; to: string; icon: React.ReactNode; }> =
  ({ title, description, to, icon }) => (
    <Link
      to={to}
      className="flex items-center p-4 bg-white rounded-lg mb-3 shadow transition-colors hover:bg-gray-50"
    >
      <div className="mr-4 p-2 bg-gray-100 rounded-full">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </Link>
  );

// Botão de Ação (para upload/download)
const ActionButton: React.FC<{ title: string; description: string; onPress: () => void; icon: React.ReactNode; }> =
  ({ title, description, onPress, icon }) => (
    <button
      onClick={onPress}
      className="w-full flex items-center p-4 bg-white rounded-lg mb-3 shadow transition-colors hover:bg-gray-50 text-left"
    >
      <div className="mr-4 p-2 bg-gray-100 rounded-full">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );

export const SettingsScreen: React.FC = () => {
  const { triggerReload } = useRefresh();
  const {
    isLoading,
    isSaving,
    companyName,
    setCompanyName,
    initialBalanceInput,
    setInitialBalanceInput,
    handleSave,
  } = useSettings();

  // Ref para o input de arquivo (para importação)
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await handleSave();
        alert('Configurações salvas!');
    } catch (e: any) {
        alert(`Erro: ${e.message}`);
    }
  };

  const handleExportData = async () => {
    try {
      const jsonString = await exportDataAsJson();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'backup-cfpratico.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Erro ao Exportar: ${e?.message ?? e}`);
    }
  };

  const handleImportClick = () => {
    // Abre o seletor de arquivos
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("ATENÇÃO: Isso limpará TODOS os dados atuais e os substituirá pelo arquivo selecionado. Deseja continuar?")) {
        // Limpa o input se o usuário cancelar
        if(fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    try {
        const jsonString = await file.text();
        await importDataFromJson(jsonString);
        triggerReload();
        alert('Sucesso! Dados restaurados.');
    } catch (e: any) {
        alert(`Erro ao Importar: ${e?.message ?? e}`);
    } finally {
        // Limpa o input
        if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleResetApp = async () => {
    if (window.confirm("PERIGO: Isso apagará TODOS os dados e restaurará o aplicativo ao estado inicial. Deseja continuar?")) {
        try {
            await DB.resetDatabaseToDefaults();
            triggerReload();
            alert('Aplicativo Resetado. Os dados foram restaurados ao padrão.');
        } catch (e: any) {
            alert(`Erro no Reset: ${e?.message ?? e}`);
        }
    }
  };

  return (
    <MainContainer>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Configurações</h1>

      {/* --- Dados da Empresa --- */}
      <form onSubmit={onSaveSettings} className="p-4 bg-white rounded-lg shadow mb-6 max-w-2xl">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Dados da Empresa</h2>
        {isLoading ? (
          <p>Carregando...</p>
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
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 text-white hover:bg-blue-700"
            />
          </>
        )}
      </form>

      <Divider />

      {/* --- Personalização (Links) --- */}
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4 mt-4">Personalização</h2>
        <NavLink
            title="Gerenciar Categorias"
            description="Adicione, edite ou remova categorias de transação."
            icon={<Database size={22} className="text-gray-600" />}
            to="/settings/categories"
        />
        <NavLink
            title="Gerenciar Formas de Pagamento"
            description="Adicione, edite ou remova formas de pagamento."
            icon={<Wallet size={22} className="text-gray-600" />}
            to="/settings/payment-methods"
        />
      </div>

      <Divider />

      {/* --- Suporte (Link) --- */}
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4 mt-4">Suporte</h2>
        <NavLink
            title="Ajuda e FAQ"
            description="Tire suas dúvidas sobre o uso do aplicativo."
            icon={<HelpCircle size={22} className="text-gray-600" />}
            to="/settings/help"
        />
      </div>

      <Divider />

      {/* --- Backup (Botões de Ação) --- */}
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4 mt-4">Backup e Restauração</h2>
        <ActionButton
            title="Exportar Dados"
            description="Salva um arquivo (.json) com todos os seus dados."
            icon={<UploadCloud size={22} className="text-green-600" />}
            onPress={handleExportData}
        />
        
        {/* Input de arquivo oculto para importação */}
        <input
            type="file"
            accept=".json,application/json"
            ref={fileInputRef}
            onChange={handleFileSelected}
            className="hidden"
        />
        <ActionButton
            title="Importar (Restaurar) Dados"
            description="Substitui os dados atuais por um arquivo de backup."
            icon={<DownloadCloud size={22} className="text-yellow-600" />}
            onPress={handleImportClick}
        />
        <ActionButton
            title="Resetar Aplicativo"
            description="Apaga todos os dados e restaura o padrão de fábrica."
            icon={<RefreshCw size={22} className="text-red-600" />}
            onPress={handleResetApp}
        />
      </div>
    </MainContainer>
  );
};