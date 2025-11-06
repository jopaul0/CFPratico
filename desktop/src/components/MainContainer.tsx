import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  showBackButton?: boolean;
}

export const MainContainer: React.FC<MainContainerProps> = ({
  children,
  className,
  title,
  showBackButton = false,
}) => {
  const navigate = useNavigate();
  const handleBack = () => navigate(-1);

  return (
    <main className={`p-4 md:p-8 max-w-7xl mx-auto w-full ${className}`}>
      {(title || showBackButton) && (
        <div className="flex items-center mb-6">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="p-2 mr-2 -ml-2 rounded-full text-gray-700 hover:bg-gray-200 hover:cursor-pointer"
              aria-label="Voltar"
            >
              <ArrowLeft size={22} />
            </button>
          )}
          {title && (
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {title}
            </h1>
          )}
        </div>
      )}
      {children}
    </main>
  );
};