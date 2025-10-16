import React from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface MainContainerProps {
  title: string;
  hasBackButton?: boolean;
  hasHeader?: boolean;
  onBackPress?: () => void; // opcional: sobrescreve o goBack padrão
  children: React.ReactNode;
}

export const MainContainer: React.FC<MainContainerProps> = ({
  title,
  hasBackButton = false,
  hasHeader = false,
  onBackPress,
  children,
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) return onBackPress();
    if (navigation.canGoBack()) navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
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
            {hasHeader && (<View className="px-4 pt-4 pb-2 border-b border-gray-200 bg-white sticky top-0 w-full z-10">
            <View className="flex-row items-center">
              {hasBackButton && (
                <Pressable
                  onPress={handleBack}
                  accessibilityRole="button"
                  accessibilityLabel="Voltar"
                  hitSlop={12}
                  className="mr-3"
                >
                  <ChevronLeft size={24} color="#374151" />
                </Pressable>
              )}

              <Text className="text-2xl font-bold text-gray-800 flex-shrink">
                {title}
              </Text>
            </View>
          </View>)}

          <View className="p-4 md:p-8 max-w-6xl mx-auto w-full">
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
