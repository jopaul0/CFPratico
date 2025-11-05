import React from 'react';

interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContainer: React.FC<MainContainerProps> = ({ children, className }) => {
  return (
    <main className={`p-4 md:p-8 max-w-7xl mx-auto w-full ${className}`}>
      {children}
    </main>
  );
};