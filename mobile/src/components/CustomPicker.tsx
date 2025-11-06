// src/components/CustomPicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronDown, X } from 'lucide-react-native';
import type { Option } from '../types/Filters';

interface CustomPickerProps {
  label: string;
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const CONTROL_HEIGHT = Platform.OS === 'android' ? 52 : 44;

export const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Selecione...',
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedLabel =
    options.find((o) => o.value === selectedValue)?.label ?? placeholder;

  const renderItem = ({ item }: { item: Option }) => (
    <TouchableOpacity
      onPress={() => {
        onValueChange(item.value);
        setModalVisible(false);
      }}
      className="p-4 border-b border-gray-200"
    >
      <Text
        className={`text-base ${
          item.value === selectedValue
            ? 'text-blue-600 font-semibold'
            : 'text-gray-800'
        }`}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="mb-3">
      <Text className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </Text>
      
      {/* O "Botão" que abre o Modal */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 flex-row items-center justify-between"
        style={{ minHeight: CONTROL_HEIGHT }}
      >
        <Text
          className={`text-sm ${
            selectedValue ? 'text-gray-800' : 'text-gray-400'
          } font-medium`}
          numberOfLines={1}
        >
          {selectedLabel}
        </Text>
        <ChevronDown size={20} color="#6b7280" />
      </TouchableOpacity>

      {/* O Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1">
          <TouchableOpacity
            style={{ flex: 1 }}
            className="bg-black/50"
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View
              className="m-8 bg-white rounded-lg shadow-lg"
              style={{ maxHeight: '70%' }}
              // Impede que o clique feche o modal
              onStartShouldSetResponder={() => true} 
            >
              {/* Cabeçalho do Modal */}
              <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-gray-800">
                  {label}
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Lista de Opções */}
              <FlatList
                data={options}
                renderItem={renderItem}
                keyExtractor={(item) => item.value}
              />
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </View>
  );
};