// src/screens/SettingsScreen.tsx
import React, { useRef, useCallback } from 'react'; // Adicionado useCallback

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
import { Database, Wallet, UploadCloud, DownloadCloud, RefreshCw, HelpCircle, Image as ImageIcon } from 'lucide-react'; // Ícones
import { useModal } from '../contexts/ModalContext';

export const SettingsScreen: React.FC = () => {
  const { triggerReload } = useRefresh();
  const {
    isLoading,
    isSaving,
    companyName,
    setCompanyName,
    initialBalanceInput,
    setInitialBalanceInput,
    companyLogo,
    setCompanyLogo,
    handleSave,
  } = useSettings();
  const { alert, confirm } = useModal();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSave();
      await alert('Sucesso!', 'Configurações salvas!', 'success');
      triggerReload();
    } catch (e: any) {
      await alert('Erro', e.message, 'error');
    }
  };

  const handleOpenLogoPicker = useCallback(async () => {
    try {
      const result = await window.ipcRenderer.invoke('open-logo-picker');

      if (result.success) {
        setCompanyLogo(result.dataUrl);
      } else if (result.error) {
        await alert('Erro ao carregar logo', result.error, 'error');
      }  
    } catch (e: any) {
      console.error("Erro ao invocar 'open-logo-picker':", e);
      await alert('Erro', 'Ocorreu uma falha ao abrir o seletor de arquivos.', 'error');
    }
  }, [alert, setCompanyLogo]);

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
      await alert('Erro ao Exportar', e?.message ?? e, 'error');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userConfirmed = await confirm(
      'Atenção!',
      'Isso limpará TODOS os dados atuais e os substituirá pelo arquivo selecionado. Deseja continuar?',
      { type: 'warning', confirmText: 'Continuar' }
    );
    if (!userConfirmed) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const jsonString = await file.text();
      await importDataFromJson(jsonString);
      await alert('Sucesso!', 'Dados restaurados. O aplicativo será reiniciado.', 'success');
      window.location.reload();
    } catch (e: any) {
      await alert('Erro ao Importar', e?.message ?? e, 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleResetApp = async () => {
    const userConfirmed = await confirm(
      'Atenção!',
      'Isso limpará TODOS os dados atuais. Deseja continuar?',
      { type: 'warning', confirmText: 'Continuar' }
    );
    
    if (userConfirmed) {
      try {
        await DB.resetDatabaseToDefaults();
        await alert('Aplicativo Resetado', 'Os dados foram restaurados ao padrão. O aplicativo será reiniciado.', 'success');
        window.location.reload();
      } catch (e: any) {
        await alert('Erro no Reset', e?.message ?? e, 'error');
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
            {/* --- SEÇÃO DA LOGO (NOVO) --- */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo da Empresa
              </label>
              <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="w-20 h-20 rounded-lg border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon size={32} className="text-gray-400" />
                  )}
                </div>
                {/* Botões */}
                <div className="flex flex-col gap-2">
                  <SimpleButton
                    title="Alterar Logo"
                    type="button"
                    onPress={handleOpenLogoPicker}
                  />
                  {companyLogo && (
                    <SimpleButton
                      title="Remover"
                      type="button"
                      onPress={() => setCompanyLogo(null)}
                      className="bg-red-50 text-red-700 hover:bg-red-100"
                    />
                  )}
                </div>
              </div>
              {/* Input de logo oculto REMOVIDO */}
            </div>
            {/* --- FIM DA SEÇÃO DA LOGO --- */}

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
      {/* ... (sem alterações) ... */}
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
      {/* ... (sem alterações) ... */}
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
      {/* ... (sem alterações, exceto o input de backup que já existia) ... */}
      <div className="w-full">
        <h2 className="text-xl font-bold text-gray-800 mb-4 mt-4">Backup e Restauração</h2>
        <ActionButton
          title="Exportar Dados"
          description="Salva um arquivo (.json) com todos os seus dados."
          icon={<UploadCloud size={22} className="text-green-600" />}
          onPress={handleExportData}
        />
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