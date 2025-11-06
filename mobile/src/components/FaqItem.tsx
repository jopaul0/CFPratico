import React from 'react';
import { View, Text } from 'react-native';

export const FaqItem: React.FC<{ q: string; a: string }> = ({ q, a }) => (
  <View className="mb-4 p-4 bg-white rounded-lg shadow">
    <Text className="text-base font-semibold text-gray-800 mb-2">{q}</Text>
    <Text className="text-sm text-gray-600 leading-5">{a}</Text>
  </View>
);