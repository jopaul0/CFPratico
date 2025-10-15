import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SimpleButtonProps {
  onPress: () => void;
  title: string;
  className?: string;
}

export const SimpleButton: React.FC<SimpleButtonProps> = ({ onPress, title, className = ""}) => {
  return (
    <TouchableOpacity 
    onPress={onPress}
    className={`py-2 px-4 rounded-lg border border-gray-300 bg-white shadow-sm hover:bg-gray-50 ${className}`}
    >
        <Text className="text-sm font-semibold text-gray-700 text-center">{title}</Text>
    </TouchableOpacity>
  );
};