import { useState, useRef } from 'react';
import { Alert } from 'react-native';

import { File, Paths } from 'expo-file-system'; 
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { captureRef } from 'react-native-view-shot';
import * as XLSX from 'xlsx';

import { formatToBRL } from '../utils/Value';
import { parseStringToDate } from '../utils/Date';
import { useDashboardData } from './useDashboardData'; 

type ReportData = ReturnType<typeof useDashboardData>;

interface UseReportExporterProps {
  data: ReportData;
  logoBase64: string | null;
}

export const useReportExporter = ({ data, logoBase64 }: UseReportExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const timeChartRef = useRef(null);
  const expenseChartRef = useRef(null);
  const revenueChartRef = useRef(null);

 
  const formatShortDate = (isoDate: string) => {
    try {
     
      return parseStringToDate(isoDate).toLocaleDateString('pt-BR');
    } catch (e) {
      return isoDate;
    }
  };

  /**
   * Gera um arquivo Excel (.xlsx) com os dados filtrados.
   * (Mantida a sua versão corrigida)
   */
  const handleExportExcel = async () => {
    if (data.filteredTransactions.length === 0) {
      Alert.alert("Nenhum dado", "Não há transações no período selecionado para exportar.");
      return;
    }

    setIsExporting(true);
    try {
      // 1. Mapear dados
      const header = ["Data", "Descrição", "Categoria", "Forma de Pagamento", "Tipo", "Valor"];
      const aoa = data.filteredTransactions.map(tx => [
        formatShortDate(tx.date),
        tx.description || '',
        tx.category_name || 'N/A',
        tx.payment_method_name || 'N/A',
        tx.type === 'revenue' ? 'Receita' : 'Despesa',
        tx.value 
      ]);

      // 2. Criar a planilha
      const ws = XLSX.utils.aoa_to_sheet([header, ...aoa]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Relatorio");

      // 3. Gerar a string base64
      const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      
      // 4. Salvar e compartilhar (com sua correção)
      const documentsDir = Paths.document;
      const filename = 'relatorio_cfpratico.xlsx';
      const excelFile = new File(documentsDir, filename);
      await excelFile.write(base64, { encoding: 'base64' });

      await Sharing.shareAsync(excelFile.uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
   * --- (FUNÇÃO TOTALMENTE ATUALIZADA) ---
   */
  const createPdfHtml = (chartsBase64?: { time?: string; expense?: string; revenue?: string }) => {
    const { 
        summary, 
        filteredTransactions, 
        rawTransactions, // <-- Novo
        userConfig, // <-- Novo
        startDate // <-- Novo
    } = data;
    
    // --- 1. Calcular Saldo Anterior ---
    const initialBalance = userConfig?.initial_balance || 0;
    // Data de início do filtro (precisa ser objeto Date)
    const filterStartDate = parseStringToDate(startDate); 
    
    let saldoAnterior = initialBalance;
    // Ordenar rawTransactions por data (importante para cálculo)
    const allSortedTxs = [...rawTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const tx of allSortedTxs) {
        const txDate = new Date(tx.date);
        // Compara o timestamp da data da transação com o início do dia do filtro
        if (txDate.getTime() < filterStartDate.getTime()) {
            saldoAnterior += tx.value;
        }
    }

    // --- 2. Gerar Linhas da Tabela com Saldo Contínuo ---
    let runningBalance = saldoAnterior;
    const transactionRows = filteredTransactions
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Ordena por data
      .map(tx => {
          runningBalance += tx.value; // Atualiza o saldo
          return `
            <tr class="tx-row">
              <td>${formatShortDate(tx.date)}</td>
              <td>${tx.description || '-'}</td>
              <td class="${tx.type === 'revenue' ? 'receita' : 'despesa'}">
                ${formatToBRL(tx.value)}
              </td>
              <td class="balance">${formatToBRL(runningBalance)}</td>
            </tr>
          `;
      }).join('');
      
    // --- 3. Seção de Gráficos (igual) ---
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
    
    // --- 4. Logo e Nome da Empresa ---
    const logoHtml = logoBase64 
        ? `<img src="data:image/png;base64,${logoBase64}" class="logo" />` 
        : '';
    const companyName = userConfig?.company_name || 'CFPratico';

    // --- 5. Montagem Final do HTML ---
    return `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; margin: 25px; }
            .header { display: flex; flex-direction: row; align-items: center; border-bottom: 2px solid #555; padding-bottom: 10px; }
            .logo { width: 50px; height: auto; margin-right: 15px; }
            h1 { font-size: 22px; color: #333; margin: 0; }
            h2 { font-size: 18px; color: #555; margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            img { width: 100%; max-width: 680px; height: auto; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f4f4f4; text-align: left; }
            .summary-table { width: 60%; max-width: 400px; margin-top: 15px; }
            .summary-table td { font-size: 14px; }
            .receita { color: green; }
            .despesa { color: red; }
            .balance { text-align: right; font-weight: bold; }
            .total { font-weight: bold; font-size: 16px; text-align: right; }
            .tx-row td { vertical-align: top; }
            .balance-row td { background-color: #f9f9f9; font-weight: bold; }
            .balance-row .balance { text-align: right; }
            .page-break { page-break-before: always; }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoHtml}
            <h1>Relatório Financeiro — ${companyName}</h1>
          </div>
          
          ${chartsBase64 ? '<h2>Extrato Detalhado</h2>' : '<h2>Extrato de Movimentações</h2>'}

          <table>
            <thead>
              <tr>
                <th style="width: 15%;">Data</th>
                <th style="width: 45%;">Descrição</th>
                <th style="width: 20%; text-align: right;">Valor</th>
                <th style="width: 20%; text-align: right;">Saldo</th>
              </tr>
            </thead>
            <tbody>
              <tr class="balance-row">
                <td colspan="3"><b>SALDO ANTERIOR</b></td>
                <td class="balance">${formatToBRL(saldoAnterior)}</td>
              </tr>
              ${transactionRows || '<tr><td colspan="4">Nenhuma transação no período.</td></tr>'}
              <tr class="balance-row">
                <td colspan="3"><b>SALDO FINAL</b></td>
                <td class="balance">${formatToBRL(runningBalance)}</td>
              </tr>
            </tbody>
          </table>

          <h2>Resumo do Período</h2>
          <table class="summary-table">
            <tr>
              <td>Total de Receitas</td>
              <td class="receita" style="text-align: right;">${formatToBRL(summary.totalRevenue)}</td>
            </tr>
            <tr>
              <td>Total de Despesas</td>
              <td class="despesa" style="text-align: right;">${formatToBRL(summary.totalExpense)}</td>
            </tr>
            <tr>
              <td><b>Saldo do Período</b></td>
              <td class="total">${formatToBRL(summary.netBalance)}</td>
            </tr>
          </table>
          
          ${chartsSection}
          
        </body>
      </html>
    `;
  };

  /**
   * Gera um PDF "Extrato Simples" (sem gráficos).
   * (Sem alteração na lógica, apenas chama o novo HTML)
   */
  const handleExportPdfSimple = async () => {
    if (data.filteredTransactions.length === 0 && (data.userConfig?.initial_balance ?? 0) === 0) {
      Alert.alert("Nenhum dado", "Não há transações ou saldo inicial para exportar.");
      return;
    }
    
    setIsExporting(true);
    try {
      const html = createPdfHtml(); // <-- Usará o novo HTML
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
   * (Sem alteração na lógica, apenas chama o novo HTML)
   */
  const handleExportPdfWithCharts = async () => {
    if (data.filteredTransactions.length === 0 && (data.userConfig?.initial_balance ?? 0) === 0) {
      Alert.alert("Nenhum dado", "Não há transações ou saldo inicial para exportar.");
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
      const html = createPdfHtml({ // <-- Usará o novo HTML
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
    timeChartRef,
    expenseChartRef,
    revenueChartRef,
  };
};