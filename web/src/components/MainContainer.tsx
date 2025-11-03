import React from 'react';

interface MainContainerProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const MainContainer: React.FC<MainContainerProps> = ({
  children,
  noPadding = false,
}) => {
  return (
    <div
      className={`flex-1 ${
        noPadding ? '' : 'p-4 md:p-8'
      } w-full max-w-6xl mx-auto`}
    >
      {children}
    </div>
  );
};