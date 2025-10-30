import React from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { UploadCloud } from 'lucide-react-native';

interface DashboardExportButtonProps {
  // --- MUDANÇA: Props simplificadas ---
  onExportPDF: () => void;
  onExportExcel: () => void;
  isLoading?: boolean;
}

export const DashboardExportButton: React.FC<DashboardExportButtonProps> = ({
  onExportPDF, // <-- Prop atualizada
  onExportExcel,
  isLoading = false,
}) => {
  
  const showExportOptions = () => {
    Alert.alert(
      "Exportar Relatório",
      "Selecione o formato desejado para o período filtrado:",
      [
        // --- MUDANÇA: Opções simplificadas ---
        { text: "PDF (Extrato + Resumo)", onPress: onExportPDF },
        { text: "Excel (Dados Completos)", onPress: onExportExcel },
        { text: "Cancelar", style: "cancel" }
      ],
      { cancelable: true }
    );
  };

  const buttonClass = isLoading
    ? 'bg-gray-400'
    : 'bg-blue-600 active:bg-blue-700';

  return (
    <View className="p-4 bg-white rounded-lg shadow mt-4">
      <TouchableOpacity
        onPress={showExportOptions}
        disabled={isLoading}
        className={`flex-row items-center justify-center p-3 rounded-lg shadow-md ${buttonClass}`}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <UploadCloud size={20} color="#ffffff" />
        )}
        <Text className="text-white text-base font-semibold ml-2">
          {isLoading ? 'Exportando...' : 'Exportar Relatório'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};