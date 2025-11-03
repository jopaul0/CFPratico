
import React from 'react';

interface SimpleButtonProps {
  onPress?: () => void;
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
      type="button"
      className={`py-2 px-4 rounded-lg border border-gray-300 shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 ${className}`}
    >
      {title}
    </button>
  );
};