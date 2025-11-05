import React from 'react';

interface SimpleButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  title: string;
  className?: string;
  type?: 'button' | 'submit' | 'reset'; 
}

export const SimpleButton: React.FC<SimpleButtonProps> = ({
  onPress,
  disabled = false,
  title,
  className = '',
  type = 'button',
}) => {
  const baseClasses = 'py-2 px-4 rounded-lg border border-gray-300 shadow-sm text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const defaultColors = 'bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-200';
  const hasColorClasses = /bg-|text-/.test(className);

  return (
    <button
      type={type}
      onClick={onPress}
      disabled={disabled}
      className={`${baseClasses} ${!hasColorClasses ? defaultColors : ''} ${className}`}
    >
      {title}
    </button>
  );
};