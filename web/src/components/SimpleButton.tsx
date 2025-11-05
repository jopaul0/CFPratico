import React from 'react';

interface SimpleButtonProps {
  onPress: () => void;
  disabled?: boolean;
  title: string;
  className?: string;
}

export const SimpleButton: React.FC<SimpleButtonProps> = ({
  onPress,
  disabled = false,
  title,
  className = '',
}) => {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={`py-2 px-4 rounded-lg border border-gray-300 shadow-sm text-sm font-semibold transition-colors
                  bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${className}`}
    >
      {title}
    </button>
  );
};