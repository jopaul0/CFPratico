// src/components/ActionButtons.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ActionButtonsProps {
  onExportCSV: () => void;
  onImportCSV: () => void;
  onExportPDF: () => void;
  onPrint: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  onExportCSV, 
  onImportCSV, 
  onExportPDF, 
  onPrint 
}) => {
  return (
    <View className="flex-row flex-wrap gap-2 justify-end">
      
      {/* Botão Exportar CSV */}
      <TouchableOpacity
        onPress={onExportCSV}
        className="py-2 px-4 rounded-lg border border-gray-300 bg-white shadow-sm active:bg-gray-50"
      >
        <Text className="text-sm font-semibold text-gray-700">Exportar CSV</Text>
      </TouchableOpacity>

      {/* Botão Importar CSV */}
      <TouchableOpacity
        onPress={onImportCSV} 
        className="py-2 px-4 rounded-lg border border-gray-300 bg-white shadow-sm active:bg-gray-50"
      >
        <Text className="text-sm font-semibold text-gray-700">Importar CSV</Text>
        {/* Input type="file" é simulado em RN, mas o TouchableOpacity replica a ação do label */}
      </TouchableOpacity>

      {/* Botão Exportar PDF */}
      <TouchableOpacity
        onPress={onExportPDF}
        className="py-2 px-4 rounded-lg border border-gray-300 bg-white shadow-sm active:bg-gray-50"
      >
        <Text className="text-sm font-semibold text-gray-700">Exportar PDF</Text>
      </TouchableOpacity>

      {/* Botão Imprimir */}
      <TouchableOpacity
        onPress={onPrint}
        className="py-2 px-4 rounded-lg border border-gray-300 bg-white shadow-sm active:bg-gray-50"
      >
        <Text className="text-sm font-semibold text-gray-700">Imprimir</Text>
      </TouchableOpacity>
    </View>
  );
};