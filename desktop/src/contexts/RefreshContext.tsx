import React, { createContext, useContext, useState, useCallback } from 'react';

interface RefreshContextType {
  refreshTrigger: number;
  triggerReload: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const RefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerReload = useCallback(() => {
    setRefreshTrigger(prev => prev + 1); 
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshTrigger, triggerReload }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (context === undefined) {
    throw new Error('useRefresh deve ser usado dentro de um RefreshProvider');
  }
  return context;
};