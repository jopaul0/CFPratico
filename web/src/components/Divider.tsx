import React from 'react';

interface DividerProps {
  marginVertical?: number;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  marginVertical = 10,
  className,
}) => {
  return (
    <hr
      className={`w-full border-t border-gray-200 rounded-full ${className}`}
      style={{
        marginBlock: marginVertical,
      }}
    />
  );
};