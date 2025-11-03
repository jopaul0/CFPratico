// src/components/DashboardExportButton.tsx
// Traduzido de
// <TouchableOpacity> -> <button>

import React from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

interface DashboardExportButtonProps {
  isLoading?: boolean;
}

export const DashboardExportButton: React.FC<DashboardExportButtonProps> = ({
  isLoading = false,
}) => {
  const buttonClass = isLoading
    ? 'bg-gray-400 cursor-not-allowed'
    : 'bg-blue-600 hover:bg-blue-700';

  return (
    <div className="p-4 bg-white rounded-lg shadow mt-4">
      <button
        type="button"
        disabled={isLoading}
        className={`flex flex-row items-center justify-center p-3 rounded-lg shadow-md w-full ${buttonClass}`}
      >
        {isLoading ? (
          <Loader2 size={20} color="#ffffff" className="animate-spin" />
        ) : (
          <UploadCloud size={20} color="#ffffff" />
        )}
        <span className="text-white text-base font-semibold ml-2">
          {isLoading ? 'Exportando...' : 'Exportar Relatório'}
        </span>
      </button>
    </div>
  );
};