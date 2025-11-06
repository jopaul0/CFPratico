import React from 'react';

interface DividerProps {
  marginVertical?: number;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ className = 'my-4' }) => {
  return (
    <div
      className={`w-full h-px bg-gray-300 rounded-full ${className}`}
    />
  );
};