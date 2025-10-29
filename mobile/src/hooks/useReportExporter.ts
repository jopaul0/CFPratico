import { useState, useRef } from 'react';
import { Alert } from 'react-native';

import { File, Paths } from 'expo-file-system'; 
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { captureRef } from 'react-native-view-shot';
import * as XLSX from 'xlsx';

import { formatToBRL } from '../utils/Value';
import { parseStringToDate } from '../utils/Date';
import { DashboardData } from './useDashboardData';

// Tipos
type ReportData = Omit<DashboardData, 'recentTransactions' | 'filtersConfig' | 'reload' | 'isLoading' | 'error'>;

interface UseReportExporterProps {
  data: ReportData;
}

export const useReportExporter = ({ data }: UseReportExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);

  // Refs (sem alteração)
  const timeChartRef = useRef(null);
  const expenseChartRef = useRef(null);
  const revenueChartRef = useRef(null);

  /**
   * Converte a data ISO (YYYY-MM-DDTHH:mm:ss) para DD/MM/YYYY
   */
  const formatShortDate = (isoDate: string) => {
    try {
      return parseStringToDate(isoDate).toLocaleString('pt-BR');
    } catch (e) {
      return isoDate;
    }
  };

  /**
   * Gera um arquivo Excel (.xlsx) com os dados filtrados.
   * --- (FUNÇÃO CORRIGIDA) ---
   */
  const handleExportExcel = async () => {
    if (data.filteredTransactions.length === 0) {
      Alert.alert("Nenhum dado", "Não há transações no período selecionado para exportar.");
      return;
    }

    setIsExporting(true);
    try {
      // 1. Mapear dados (sem alteração)
      const header = ["Data", "Descrição", "Categoria", "Forma de Pagamento", "Tipo", "Valor"];
      const aoa = data.filteredTransactions.map(tx => [
        formatShortDate(tx.date),
        tx.description || '',
        tx.category_name || 'N/A',
        tx.payment_method_name || 'N/A',
        tx.type === 'revenue' ? 'Receita' : 'Despesa',
        tx.value 
      ]);

      // 2. Criar a planilha (sem alteração)
      const ws = XLSX.utils.aoa_to_sheet([header, ...aoa]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Relatorio");

      // 3. Gerar a string base64 (sem alteração)
      const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      
      // --- (CORREÇÃO 2: Lógica de salvar arquivo baseada no SettingsScreen.tsx) ---
      
      // 4. Definir o diretório e o nome do arquivo
      const documentsDir = Paths.document; // Usa o diretório de documentos
      const filename = 'relatorio_cfpratico.xlsx';

      // 5. Criar o arquivo usando a nova API
      const excelFile = new File(documentsDir, filename);

      // 6. Escrever a string base64, especificando o encoding correto
      await excelFile.write(base64, { encoding: 'base64' });

      // 7. Compartilhar o arquivo usando sua URI
      await Sharing.shareAsync(excelFile.uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Exportar para Excel',
        UTI: 'com.microsoft.excel.xlsx'
      });
      // --- (FIM DA CORREÇÃO) ---

    } catch (e: any) {
      Alert.alert("Erro ao Exportar", `Não foi possível gerar o arquivo Excel: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Gera o HTML base para os relatórios PDF.
   * (Sem alteração)
   */
  const createPdfHtml = (chartsBase64?: { time?: string; expense?: string; revenue?: string }) => {
    const { summary, filteredTransactions } = data;
    
    // Lista de transações
    const transactionRows = filteredTransactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Ordena por data
      .map(tx => `
        <tr class="tx-row">
          <td>${formatShortDate(tx.date)}</td>
          <td>${tx.description || '-'}</td>
          <td>${tx.category_name || 'N/A'}</td>
          <td class="${tx.type === 'revenue' ? 'receita' : 'despesa'}">
            ${formatToBRL(tx.value)}
          </td>
        </tr>
      `).join('');

    // Seção de gráficos
    const chartsSection = chartsBase64 ? `
      <h2>Gráficos do Período</h2>
      <h3>Receitas x Despesas por Dia</h3>
      <img src="data:image/png;base64,${chartsBase64.time}" />
      <h3>Despesas por Categoria</h3>
      <img src="data:image/png;base64,${chartsBase64.expense}" />
      <h3>Receitas por Categoria</h3>
      <img src="data:image/png;base64,${chartsBase64.revenue}" />
      <div class="page-break"></div>
    ` : '';

    // (O restante do HTML permanece o mesmo)
    return `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; margin: 20px; }
            h1 { font-size: 20px; color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 5px; }
            h2 { font-size: 18px; color: #555; margin-top: 25px; }
            img { width: 100%; max-width: 680px; height: auto; margin-bottom: 15px; border: 1px solid #eee; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f4f4f4; }
            .summary-table { width: 50%; margin-top: 15px; }
            .summary-table td { font-size: 14px; }
            .receita { color: green; font-weight: bold; }
            .despesa { color: red; font-weight: bold; }
            .total { font-weight: bold; font-size: 16px; }
            .tx-row td { vertical-align: top; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <h1>Relatório de Movimentações</h1>
          ${chartsSection}
          <h2>Resumo do Período</h2>
          <table class="summary-table">
            <tr> <td>Total de Receitas</td> <td class="receita">${formatToBRL(summary.totalRevenue)}</td> </tr>
            <tr> <td>Total de Despesas</td> <td class="despesa">${formatToBRL(summary.totalExpense)}</td> </tr>
            <tr> <td><b>Saldo do Período</b></td> <td class="total">${formatToBRL(summary.netBalance)}</td> </tr>
          </table>
          <h2>Lançamentos do Período</h2>
          <table>
            <thead> <tr> <th>Data</th> <th>Descrição</th> <th>Categoria</th> <th>Valor</th> </tr> </thead>
            <tbody>
              ${transactionRows || '<tr><td colspan="4">Nenhuma transação no período.</td></tr>'}
            </tbody>
          </table>
        </body>
      </html>
    `;
  };

  /**
   * Gera um PDF "Extrato Simples" (sem gráficos).
   * (Sem alteração, `expo-print` cuida do arquivo)
   */
  const handleExportPdfSimple = async () => {
    if (data.filteredTransactions.length === 0) {
      Alert.alert("Nenhum dado", "Não há transações no período selecionado para exportar.");
      return;
    }
    
    setIsExporting(true);
    try {
      const html = createPdfHtml();
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Exportar Extrato' });
    } catch (e: any) {
      Alert.alert("Erro ao Exportar", `Não foi possível gerar o PDF: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Gera um PDF completo, capturando os gráficos da tela.
   * (Sem alteração, `expo-print` cuida do arquivo)
   */
  const handleExportPdfWithCharts = async () => {
    if (data.filteredTransactions.length === 0) {
      Alert.alert("Nenhum dado", "Não há transações no período selecionado para exportar.");
      return;
    }
    if (!timeChartRef.current || !expenseChartRef.current || !revenueChartRef.current) {
      Alert.alert("Erro", "Não foi possível encontrar os gráficos na tela.");
      return;
    }

    setIsExporting(true);
    try {
      // 1. Capturar os gráficos
      const [timeImg, expenseImg, revenueImg] = await Promise.all([
        captureRef(timeChartRef, { format: 'png', quality: 0.9, result: 'base64' }),
        captureRef(expenseChartRef, { format: 'png', quality: 0.9, result: 'base64' }),
        captureRef(revenueChartRef, { format: 'png', quality: 0.9, result: 'base64' })
      ]);

      // 2. Gerar HTML com as imagens
      const html = createPdfHtml({
        time: timeImg,
        expense: expenseImg,
        revenue: revenueImg
      });

      // 3. Imprimir e compartilhar
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Exportar Relatório Completo' });

    } catch (e: any) {
      Alert.alert("Erro ao Exportar", `Não foi possível gerar o PDF: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

   return {
    isExporting,
    handleExportExcel,
    handleExportPdfSimple,
    handleExportPdfWithCharts,
    // Retornar as refs para a UI anexar
    timeChartRef,
    expenseChartRef,
    revenueChartRef,
  };
};