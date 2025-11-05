import React, { useState } from 'react';
import { UploadCloud, FileText, FileSpreadsheet } from 'lucide-react';

interface DashboardExportButtonProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  isLoading?: boolean;
}

export const DashboardExportButton: React.FC<DashboardExportButtonProps> = ({
  onExportPDF,
  onExportExcel,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`w-full flex items-center justify-center p-3 rounded-lg shadow-md text-white font-semibold transition-colors
                    ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        <UploadCloud size={20} className="mr-2" />
        {isLoading ? 'Exportando...' : 'Exportar Relatório'}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white rounded-lg shadow-lg border">
          <button onClick={() => { onExportPDF(); setIsOpen(false); }} className="w-full flex items-center p-2 text-left rounded hover:bg-gray-100">
            <FileText size={18} className="mr-2 text-red-600" />
            PDF (Extrato + Resumo)
          </button>
          <button onClick={() => { onExportExcel(); setIsOpen(false); }} className="w-full flex items-center p-2 text-left rounded hover:bg-gray-100">
            <FileSpreadsheet size={18} className="mr-2 text-green-600" />
            Excel (Dados Completos)
          </button>
        </div>
      )}
    </div>
  );
};