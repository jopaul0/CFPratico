import { useState } from 'react';
import * as XLSX from 'xlsx';

import { formatToBRL } from '../utils/Value';
import { parseStringToDate } from '../utils/Date';
import { useDashboardData, AggregatedData } from './useDashboardData';
import { useModal } from '../contexts/ModalContext';

type ReportData = ReturnType<typeof useDashboardData>;

interface UseReportExporterProps {
  data: ReportData;
}

export const useReportExporter = ({ data }: UseReportExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { alert } = useModal();

  const formatShortDate = (isoDate: string) => {
    try {
      // Garante que a data 'YYYY-MM-DD' seja tratada como local
      return parseStringToDate(isoDate).toLocaleDateString('pt-BR');
    } catch (e) {
      return isoDate;
    }
  };

  /**
   * Alteração 2: Exportar Excel para Desktop (Electron)
   * ATUALIZADO: Agora gera duas planilhas (Contmatic e Relatorio).
   */
  const handleExportExcel = async () => {
    if (data.filteredTransactions.length === 0) {
      await alert("Nenhum dado", "Não há transações no período selecionado para exportar.");
      return;
    }

    setIsExporting(true);
    try {
      // --- DADOS BASE ---
      // Ordena as transações por data, importante para o Lançamento
      const sortedTxs = [...data.filteredTransactions].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // --- PLANILHA 1: CONTMATIC (Novo formato) ---
      const header_contmatic = [
        "Lançamento", "Data", "Débito", "Crédito", "Valor", 
        "Histórico Padrão", "Complemento", "CCDB", "CCCR", "CNPJ"
      ];

      const aoa_contmatic = sortedTxs.map((tx, index) => {
        return [
          index + 1,                     // Lançamento (1, 2, 3...)
          formatShortDate(tx.date),      // Data
          "",                            // Débito (em branco)
          "",                            // Crédito (em branco)
          tx.value,                      // Valor (assinado, ex: -50.00 ou 150.00)
          1,                             // Histórico Padrão (sempre 1)
          tx.description || '',          // Complemento
          "",                            // CCDB (em branco)
          "",                            // CCCR (em branco)
          ""                             // CNPJ (em branco)
        ];
      });

      const ws_contmatic = XLSX.utils.aoa_to_sheet([header_contmatic, ...aoa_contmatic]);
      ws_contmatic['!cols'] = [
        { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
        { wch: 18 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 15 },
      ];


      // --- PLANILHA 2: RELATORIO (Formato antigo) ---
      const header_relatorio = [
        "Data", "Descrição", "Categoria", "Forma de Pagamento",
        "Condição", "Parcelas", "Tipo", "Valor"
      ];

      // Usamos sortedTxs aqui também para consistência
      const aoa_relatorio = sortedTxs.map(tx => {
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

      const ws_relatorio = XLSX.utils.aoa_to_sheet([header_relatorio, ...aoa_relatorio]);
      ws_relatorio['!cols'] = [
        { wch: 10 }, { wch: 35 }, { wch: 20 }, { wch: 20 },
        { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 },
      ];

      // --- CRIAÇÃO DO WORKBOOK ---
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws_contmatic, "Contmatic");
      XLSX.utils.book_append_sheet(wb, ws_relatorio, "Relatorio");

      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

      // Envia o buffer para o processo main (Electron) cuidar de salvar
      const result = await window.ipcRenderer.invoke('export-excel', buffer);

      if (!result.success && !result.canceled) {
        throw new Error(result.error || "Falha ao salvar arquivo.");
      }

    } catch (e: any) {
      await alert("Erro ao exportar", e.message || "Ocorreu um erro ao gerar o arquivo xlsx", 'error');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Alteração 1: Rodapé no PDF (OnVale)
   * (Esta função permanece a mesma da etapa anterior)
   */
  const createPdfHtml = () => {
    const {
      summary, filteredTransactions, rawTransactions, userConfig,
      startDate, endDate, byCategoryRevenue, byCategoryExpense
    } = data;

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

    const logoHtml = userConfig?.company_logo
      ? `<img src="${userConfig.company_logo}" class="logo" />`
      : `<img src="/icon.png" class="logo" />`; 

    const companyName = userConfig?.company_name || 'CFPratico';
    const reportPeriod = `<p class="period"><b>Período do Relatório:</b> ${formatShortDate(startDate)} a ${formatShortDate(endDate)}</p>`;

    const onvaleLogoSrc = "/onvale.png"; 

    return `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; margin: 25px; width: auto; }
            .header { display: flex; flex-direction: row; align-items: center; border-bottom: 2px solid #555; padding-bottom: 10px; }
            .logo { width: 50px; height: auto; max-height: 50px; object-fit: contain; margin-right: 15px; } 
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
            
            .print-footer {
                position: fixed;
                bottom: 10px;
                left: 25px;
                right: 25px;
                display: none;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #888;
                border-top: 1px solid #eee;
                padding-top: 5px;
            }
            .footer-logo {
                width: 20px;
                height: auto;
                margin-right: 8px;
            }

            @media print {
              body { padding-bottom: 40px; }
              .split-tables { display: block; }
              .table-wrapper { width: 100%; page-break-inside: avoid; }
              
              .print-footer {
                  display: flex !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-footer">
            <img src="${onvaleLogoSrc}" class="footer-logo" />
            <span>Disponibilizado por OnVale Contabilidade</span>
          </div>

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


  const handleExportPdf = async () => {
    if (data.filteredTransactions.length === 0 && (data.userConfig?.initial_balance ?? 0) === 0) {
      await alert("Nenhum dado", "Não há dados no período selecionado para exportar.");
      return;
    }

    setIsExporting(true);
    try {
      const html = createPdfHtml();

      const result: { success: boolean; filePath?: string; error?: string; canceled?: boolean } =
        await window.ipcRenderer.invoke('export-pdf', html);

      if (result.success) {
      } else if (result.error) {
        throw new Error(result.error);
      }

    } catch (e: any) {
      await alert("Erro ao exportar", e.message || "Ocorreu um erro ao gerar o arquivo PDF.", "error");
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