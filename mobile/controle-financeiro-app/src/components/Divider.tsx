import React from 'react';
import { View } from 'react-native';

interface DividerProps {
  marginVertical?: number;
  thickness?: number;
  colorClass?: string;
  widthClass?: string;
  className?: string;
}

/** Divider simples usando apenas Tailwind */
export const Divider: React.FC<DividerProps> = ({
  marginVertical = 12,
  thickness = 1,
  colorClass = 'bg-gray-200',
  widthClass = 'w-full',
  className,
}) => {
  return (
    <View
      className={[
        widthClass,
        colorClass,
        `h-[${thickness}px]`,
        `my-[${marginVertical}px]`,
        'rounded-full',
        className,
      ].join(' ')}
    />
  );
};
