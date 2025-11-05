import React, { useRef } from 'react';

import * as DB from '../services/database';
import { useRefresh } from '../contexts/RefreshContext';
import { exportDataAsJson, importDataFromJson } from '../services/dataSync';

import { MainContainer } from '../components/MainContainer';
import { InputGroup } from '../components/InputGroup';
import { SimpleButton } from '../components/SimpleButton';
import { Divider } from '../components/Divider';
import { NavLink } from '../components/NavLink';
import { ActionButton } from '../components/ActionButton';

import { useSettings } from '../hooks/useSettings';
import { Database, Wallet, UploadCloud, DownloadCloud, RefreshCw, HelpCircle } from 'lucide-react';

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
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      if (fileInputRef.current) fileInputRef.current.value = "";
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
      {/* --- Dados da Empresa --- */}
      <form onSubmit={onSaveSettings} className="p-4 bg-white rounded-lg shadow mb-6 w-full">
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
      <div className="w-full">
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
      <div className="w-full">
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
      <div className="w-full">
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