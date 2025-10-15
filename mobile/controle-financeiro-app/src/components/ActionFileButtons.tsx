import React from 'react';
import { View } from 'react-native';
import { SimpleButton } from './SimpleButton';

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
  onPrint,
}) => {
  return (
    <View className="flex flex-row flex-wrap justify-between gap-3 sm:flex-nowrap">
      {/* No mobile: 2x2 (cada botão 48%) / No sm+: 1x4 (cada botão 24%) */}
      <View className="w-[48%] sm:w-[30%]">
        <SimpleButton onPress={onExportCSV} title="Exportar CSV" />
      </View>

      <View className="w-[48%] sm:w-[30%]">
        <SimpleButton onPress={onImportCSV} title="Importar CSV" />
      </View>

      <View className="w-[48%] sm:w-[30%]">
        <SimpleButton onPress={onExportPDF} title="Exportar PDF" />
      </View>

      <View className="w-[48%] sm:w-[30%]">
        <SimpleButton onPress={onPrint} title="Imprimir" />
      </View>
    </View>
  );
};
