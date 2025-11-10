import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface ActionButtonProps {
  title: string;
  description: string;
  onPress: () => void;
  icon: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  title, 
  description, 
  onPress, 
  icon 
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center p-4 bg-white rounded-lg mb-3 shadow"
    activeOpacity={0.7}
  >
    <View className="mr-4 p-2 bg-gray-100 rounded-full">
      {icon}
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-800">{title}</Text>
      <Text className="text-sm text-gray-500">{description}</Text>
    </View>
    <ChevronRight size={20} color="#9ca3af" />
  </TouchableOpacity>
);