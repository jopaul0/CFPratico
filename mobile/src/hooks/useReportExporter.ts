// src/hooks/useReportExporter.ts
import { useState } from 'react';
import { Alert, Platform } from 'react-native';

// Imports do Expo
import { Asset } from 'expo-asset';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

// Imports do FileSystem (SDK 51+)
import { File, Paths, Directory } from 'expo-file-system'; //

// Import do AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Imports de bibliotecas e utils
import * as XLSX from 'xlsx';
import { formatToBRL } from '../utils/Value';
import { parseStringToDate } from '../utils/Date';
import { useDashboardData, AggregatedData } from './useDashboardData';

// Tipos
type ReportData = ReturnType<typeof useDashboardData>;

interface UseReportExporterProps {
  data: ReportData;
}

// Chave para salvar a URI da pasta no AsyncStorage
const DOWNLOADS_DIR_STORAGE_KEY = '@downloadsDirectoryUri';

export const useReportExporter = ({ data }: UseReportExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatShortDate = (isoDate: string) => {
    try {
      return parseStringToDate(isoDate).toLocaleDateString('pt-BR');
    } catch (e) {
      return isoDate;
    }
  };

  const getLogoBase64 = async (): Promise<string | null> => {
    try {
      const asset = Asset.fromModule(require('../assets/onvale.png')); //
      await asset.downloadAsync();

      if (Platform.OS === 'web') {
        const res = await fetch(asset.uri);
        const blob = await res.blob();
        const base64 = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onloadend = () => resolve((r.result as string).split(',')[1] ?? '');
          r.onerror = reject;
          r.readAsDataURL(blob);
        });
        return base64;
      }

      const uri = asset.localUri ?? asset.uri;
      const logoFile = new File(uri); //
      const base64 = await logoFile.base64(); //
      return base64;
    } catch (e) {
      console.error("Erro ao carregar logo 'onvale.png' para exportar:", e);
      return null;
    }
  };

  /**
   * Salva um arquivo (em base64) publicamente no Android
   * usando a API moderna de FileSystem (SDK 51+).
   * Agora, lembra a pasta escolhida pelo usuário.
   */
  const saveToDownloadsAndroid = async (
    filename: string, 
    base64Content: string, 
    mimeType: string
  ) => {
    if (Platform.OS !== 'android') {
      return; // Apenas para Android
    }

    // Função interna para realmente salvar o arquivo
    const trySave = async (dir: Directory) => {
      // Tenta criar (ou sobrescrever) o arquivo
      const safFile = dir.createFile(filename, mimeType); //
      // Escreve o conteúdo
      safFile.write(base64Content, { encoding: 'base64' }); //
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
      
      // --- (INÍCIO DA CORREÇÃO) ---
      // 2. Cria uma *instância da classe* Directory a partir da URI retornada
      // Isso corrige o type mismatch que você viu.
      const pickedDir = new Directory(pickedDirResult.uri); //
      // --- (FIM DA CORREÇÃO) ---

      // 3. Salva a URI da pasta para uso futuro
      await AsyncStorage.setItem(DOWNLOADS_DIR_STORAGE_KEY, pickedDir.uri);
      
      // 4. Tenta salvar na pasta recém-escolhida (agora com o tipo correto)
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
          // FALHOU! Provavelmente a permissão expirou ou o usuário limpou os dados.
          console.warn('Falha ao usar URI salva, pedindo novamente:', permissionError.message);
          
          // Limpa a URI ruim
          await AsyncStorage.removeItem(DOWNLOADS_DIR_STORAGE_KEY);
          
          // Pede ao usuário novamente
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


  /**
   * Gera um arquivo Excel (.xlsx)
   */
  const handleExportExcel = async () => {
    if (data.filteredTransactions.length === 0) {
      Alert.alert("Nenhum dado", "Não há transações no período selecionado para exportar.");
      return;
    }
    setIsExporting(true);
    try {
      const header = [
        "Data", "Descrição", "Categoria", "Forma de Pagamento",
        "Condição", "Parcelas", "Tipo", "Valor"
      ];

      const aoa = data.filteredTransactions.map(tx => {
        const condicao = tx.condition === 'paid' ? 'À Vista' : 'Parcelado';
        const parcelas = tx.condition === 'paid' ? 1 : tx.installments;
        return [
          formatShortDate(tx.date), tx.description || '',
          tx.category_name || 'N/A', tx.payment_method_name || 'N/A',
          condicao, parcelas,
          tx.type === 'revenue' ? 'Receita' : 'Despesa',
          tx.value
        ];
      });

      const ws = XLSX.utils.aoa_to_sheet([header, ...aoa]);
      ws['!cols'] = [
        { wch: 10 }, { wch: 35 }, { wch: 20 }, { wch: 20 },
        { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Relatorio");

      const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const filename = 'relatorio_cfpratico.xlsx';
      const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      // 1. Salva em Downloads (Android)
      await saveToDownloadsAndroid(filename, base64, mimeType);
      
      // 2. Salva no Cache (para Sharing)
      const cacheFile = new File(Paths.cache, filename); //
      cacheFile.write(base64, { encoding: 'base64' }); //
      
      // 3. Abre Sharing
      await Sharing.shareAsync(cacheFile.uri, {
        mimeType: mimeType,
        dialogTitle: 'Exportar para Excel',
        UTI: 'com.microsoft.excel.xlsx'
      });
    } catch (e: any) {
      Alert.alert("Erro ao Exportar", `Não foi possível gerar o arquivo Excel: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Gera o HTML base para os relatórios PDF.
   */
  const createPdfHtml = (logoBase64: string | null) => {
    const {
      summary, filteredTransactions, rawTransactions, userConfig,
      startDate, endDate, byCategoryRevenue, byCategoryExpense
    } = data;

    // Cálculos de Saldo Anterior
    const initialBalance = userConfig?.initial_balance || 0;
    const filterStartDate = parseStringToDate(startDate);
    let saldoAnterior = initialBalance;
    const allSortedTxs = [...rawTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    for (const tx of allSortedTxs) {
      const txDate = new Date(tx.date);
      if (txDate.getTime() < filterStartDate.getTime()) {
        saldoAnterior += tx.value;
      }
    }

    // Linhas da Tabela de Extrato
    let runningBalance = saldoAnterior;
    const transactionRows = filteredTransactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(tx => {
        runningBalance += tx.value;
        const categoria = tx.category_name || 'N/A';
        const pagamento = tx.payment_method_name || 'N/A';
        const condicao = tx.condition === 'paid' ? 'À Vista' : `Parcelado (${tx.installments}x)`;
        return `
            <tr class="tx-row">
              <td>${formatShortDate(tx.date)}</td>
              <td>
                <b>${tx.description || '-'}</b>
                <div class="meta">${categoria} | ${pagamento} | ${condicao}</div>
              </td>
              <td class="${tx.type === 'revenue' ? 'receita' : 'despesa'}">${formatToBRL(tx.value)}</td>
              <td class="balance">${formatToBRL(runningBalance)}</td>
            </tr>
          `;
      }).join('');

    // Tabelas de Resumo de Categoria
    const generateCategoryTable = (title: string, items: AggregatedData[], colorClass: 'receita' | 'despesa') => {
      if (items.length === 0) return `<h3>${title}</h3><p>Nenhum dado no período.</p>`;
      const rows = items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td class="${colorClass}">${formatToBRL(item.total)}</td>
                <td>${item.count}</td>
            </tr>`).join('');
      return `
            <h3>${title}</h3>
            <table class="category-table">
                <thead><tr>
                    <th style="width: 60%;">Categoria</th>
                    <th style="width: 25%; text-align: right;">Valor Total</th>
                    <th style="width: 15%; text-align: right;">Qtd.</th>
                </tr></thead>
                <tbody>${rows}</tbody>
            </table>`;
    };
    const categoryTablesSection = `
      <h2>Resumo por Categoria</h2>
      <div class="split-tables">
          <div class="table-wrapper">
              ${generateCategoryTable('Receitas por Categoria', byCategoryRevenue, 'receita')}
          </div>
          <div class="table-wrapper">
              ${generateCategoryTable('Despesas por Categoria', byCategoryExpense, 'despesa')}
          </div>
      </div>`;

    // Logo, Nome e Período
    const logoHtml = logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" class="logo" />` : '';
    const companyName = userConfig?.company_name || 'CFPratico';
    const reportPeriod = `<p class="period"><b>Período do Relatório:</b> ${formatShortDate(startDate)} a ${formatShortDate(endDate)}</p>`;

    // Montagem Final do HTML
    return `
      <html>
        <head>
          <style>
            body { 
              font-family: sans-serif; 
              margin: 25px;
              width: auto;
            }
            .header { display: flex; flex-direction: row; align-items: center; border-bottom: 2px solid #555; padding-bottom: 10px; }
            .logo { width: 50px; height: auto; margin-right: 15px; }
            h1 { font-size: 22px; color: #333; margin: 0; }
            h2 { font-size: 18px; color: #555; margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            h3 { font-size: 16px; color: #444; margin-top: 20px; margin-bottom: 10px; }
            p { font-size: 13px; }
            .period { font-size: 13px; color: #333; margin-top: 5px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f4f4f4; text-align: left; }
            
            .summary-table { width: 60%; max-width: 400px; margin-top: 15px; }
            .summary-table td { font-size: 14px; }
            
            .receita { color: green; text-align: right; }
            .despesa { color: red; text-align: right; }
            .balance { text-align: right; font-weight: bold; }
            .total { font-weight: bold; font-size: 16px; text-align: right; }
            
            .tx-row td { vertical-align: top; }
            .tx-row b { font-size: 13px; }
            .meta { font-size: 11px; color: #555; margin-top: 3px; }
            
            .balance-row td { background-color: #f9f9f9; font-weight: bold; }
            .balance-row .balance { text-align: right; }
            
            .category-table td:nth-child(2), .category-table th:nth-child(2) { text-align: right; }
            .category-table td:nth-child(3), .category-table th:nth-child(3) { text-align: right; }
            
            .split-tables { display: flex; flex-direction: row; justify-content: space-between; gap: 20px; }
            .table-wrapper { width: 48%; vertical-align: top; }

            @media print {
              .split-tables { display: block; }
              .table-wrapper { width: 100%; page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">${logoHtml}<h1>Relatório Financeiro — ${companyName}</h1></div>
          ${reportPeriod}
          <h2>Extrato de Movimentações</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Data</th>
                <th style="width: 50%;">Descrição / Detalhes</th>
                <th style="width: 15%; text-align: right;">Valor</th>
                <th style="width: 20%; text-align: right;">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr class="balance-row"><td colspan="3"><b>SALDO ANTERIOR</b></td><td class="balance">${formatToBRL(saldoAnterior)}</td></tr>
              ${transactionRows || '<tr><td colspan="4">Nenhuma transação no período.</td></tr>'}
              <tr class="balance-row"><td colspan="3"><b>SALDO FINAL</b></td><td class="balance">${formatToBRL(runningBalance)}</td></tr>
            </tbody>
          </table>
          <h2>Resumo Geral do Período</h2>
          <table class="summary-table">
            <tr><td>Total de Receitas</td><td class="receita">${formatToBRL(summary.totalRevenue)}</td></tr>
            <tr><td>Total de Despesas</td><td class="despesa">${formatToBRL(summary.totalExpense)}</td></tr>
            <tr><td><b>Saldo do Período</b></td><td class="total">${formatToBRL(summary.netBalance)}</td></tr>
          </table>
          ${categoryTablesSection}
        </body>
      </html>
    `;
  };

  /**
   * Gera um PDF.
   */
  const handleExportPdf = async () => {
    if (data.filteredTransactions.length === 0 && (data.userConfig?.initial_balance ?? 0) === 0) {
      Alert.alert("Nenhum dado", "Não há transações ou saldo inicial para exportar.");
      return;
    }

    setIsExporting(true);
    try {
      // 1. Gerar PDF (tempUri tem nome aleatório)
      const logoBase64 = await getLogoBase64();
      const html = createPdfHtml(logoBase64);
      const { uri: tempUri } = await Print.printToFileAsync({
        html,
        margins: { top: 80, bottom: 80, left: 60, right: 60 }
      });

      const pdfFilename = 'relatorio-cfpratico.pdf';
      const mimeType = 'application/pdf';

      // 2. Definir o destino final no cache com o nome correto
      const shareableFile = new File(Paths.cache, pdfFilename); //
      const tempFile = new File(tempUri); //

      // 3. Se o arquivo já existir (de um export anterior), delete-o
      if (shareableFile.exists) { //
        shareableFile.delete(); //
      }

      // 4. Mover (renomear) o arquivo temporário para o arquivo final
      tempFile.move(shareableFile); //
      
      // 5. Ler o conteúdo (base64) do arquivo JÁ RENOMEADO para salvar no Android
      const base64Content = shareableFile.base64Sync(); //
      await saveToDownloadsAndroid(pdfFilename, base64Content, mimeType);

      // 6. Abre o compartilhamento (em todas as plataformas)
      //    USANDO O ARQUIVO RENOMEADO
      await Sharing.shareAsync(shareableFile.uri, {
        mimeType: mimeType,
        dialogTitle: 'Exportar Relatório PDF'
      });

    } catch (e: any) {
      Alert.alert("Erro ao Exportar", `Não foi possível gerar o PDF: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    handleExportExcel,
    handleExportPdf,
  };
};