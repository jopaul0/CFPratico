// src/components/MainContainer.tsx
import React from 'react';
import { 
    View, 
    ScrollView, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform, 
    RefreshControl, 
    RefreshControlProps
} from 'react-native'; 

interface MainContainerProps {
  hasButton?: boolean;
  iconButton?: React.ReactNode;
  colorButton?: string;
  onPressButton?: () => void;
  children: React.ReactNode;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  scrollEnabled?: boolean; // <-- NOVA PROP
  noPadding?: boolean;     // <-- NOVA PROP
}

export const MainContainer: React.FC<MainContainerProps> = ({
  hasButton = false,
  iconButton,
  colorButton = '#3b82f6',
  onPressButton,
  children,
  refreshControl,
  scrollEnabled = true, // <-- Padrão: com scroll
  noPadding = false,    // <-- Padrão: com padding
}) => {

  // O conteúdo que vai dentro do ScrollView ou View
  // Se noPadding for true, renderiza os filhos diretamente
  // Se não, envolve no padding padrão
  const content = noPadding ? (
    children
  ) : (
    <View className="p-4 md:p-8 max-w-6xl mx-auto w-full">
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      {scrollEnabled ? (
        // --- VERSÃO COM SCROLL (Padrão para Dashboard, Settings) ---
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {content}
        </ScrollView>
      ) : (
        // --- VERSÃO SEM SCROLL (Para SectionList) ---
        // O refreshControl é ignorado aqui, pois será passado para o SectionList
        <View className="flex-1">
          {content}
        </View>
      )}

      {/* Botão Flutuante (continua igual) */}
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