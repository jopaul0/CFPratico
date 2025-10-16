import React from 'react';
import { View } from 'react-native';

interface DividerProps {
  marginVertical?: number;
  thickness?: number;
  colorClass?: string;
  widthClass?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  marginVertical = 10,
  thickness = 1,
  colorClass = 'bg-gray-300',
  widthClass = 'w-full',
  className,
}) => {
  return (
    <View
      className={[
        widthClass,
        colorClass,
        'rounded-full',
        className,
      ].join(' ')}
      style={{
        height: thickness,
        marginVertical,
      }}
    />
  );
};
