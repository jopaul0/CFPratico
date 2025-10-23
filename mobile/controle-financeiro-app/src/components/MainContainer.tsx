import React from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

interface MainContainerProps {
  hasButton?: boolean;
  iconButton?: React.ReactNode;
  colorButton?: string;
  onPressButton?: () => void;
  children: React.ReactNode;
}

export const MainContainer: React.FC<MainContainerProps> = ({
  hasButton = false,
  iconButton,
  colorButton = '#3b82f6',
  onPressButton,
  children
}) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View className="p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={onPressButton}
        className="absolute bottom-6 right-6 p-4 rounded-full shadow-lg"
        style={{
          backgroundColor: colorButton,
          elevation: 5,
          display: hasButton ? 'flex' : 'none',
        }}
        activeOpacity={0.8}
      >
        {iconButton}
      </TouchableOpacity>

    </KeyboardAvoidingView>
  );
};
