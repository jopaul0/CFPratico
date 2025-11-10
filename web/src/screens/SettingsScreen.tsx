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
    initialBalanceSign,
    setInitialBalanceSign,
    handleSave,
  } = useSettings();
  const { alert, confirm } = useModal();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSave();
      await alert('Sucesso!', 'Configurações salvas!', 'success');
    } catch (e: any) {
      await alert('Erro', e.message, 'error');
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

  const toggleSign = () => {
    setInitialBalanceSign(prev => (prev === 'positive' ? 'negative' : 'positive'));
  };

  const isNegative = initialBalanceSign === 'negative';

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

            {/* --- GRUPO DE SALDO INICIAL ATUALIZADO --- */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saldo Inicial
              </label>
              <div className="flex items-center gap-2">

                 {/* Input (agora dentro do flex) */}
                <div className="flex-1">
                  <InputGroup
                    label=""
                    placeholder="0,00"
                    keyboardType="numeric"
                    value={initialBalanceInput}
                    onChangeText={setInitialBalanceInput}
                  />
                </div>
                
                {/* Botão de Sinal */}
                <button
                  type="button"
                  onClick={toggleSign}
                  className={`
                    w-14 h-11 rounded-lg border mb-2 font-semibold text-sm transition-colors
                    ${isNegative 
                      ? 'bg-red-100 border-red-300 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
                    }
                  `}
                >
                  {isNegative ? '-' : '+'}
                </button>
                
               
              </div>
            </div>
            {/* --- FIM DO GRUPO --- */}

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