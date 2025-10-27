import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface SimpleButtonProps {
  onPress: () => void;
  disabled?: boolean;
  title: string;
  className?: string;
  backgroundColor?: string;
  textColor?: string;
  activeBackgroundColor?: string;
}

/**
 * Botão simples e personalizável para uso geral.
 * Permite definir cores personalizadas de texto e fundo.
 */
export const SimpleButton: React.FC<SimpleButtonProps> = ({
  onPress,
  disabled = false,
  title,
  className = '',
  backgroundColor = '#ffffff',
  textColor = '#374151', // gray-700
  activeBackgroundColor = '#f3f4f6', // gray-100
}) => {
  const [isPressed, setIsPressed] = React.useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      disabled={disabled}
      className={`py-2 px-4 rounded-lg border border-gray-300 shadow-sm ${className}`}
      style={{
        backgroundColor: isPressed ? activeBackgroundColor : backgroundColor,
      }}
    >
      <Text
        className="text-sm font-semibold text-center"
        style={{ color: textColor }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
