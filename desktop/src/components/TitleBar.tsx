import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const handleWindowStateChange = (event: any, state: string) => {
      setIsMaximized(state === 'maximized');
    };
    
    window.ipcRenderer.on('window-state-changed', handleWindowStateChange);

    return () => {
      window.ipcRenderer.off('window-state-changed', handleWindowStateChange);
    };
  }, []);

  const handleMinimize = () => {
    window.ipcRenderer.send('minimize-window');
  };

  const handleMaximize = () => {
    window.ipcRenderer.send('maximize-window');
  };

  const handleClose = () => {
    window.ipcRenderer.send('close-window');
  };

  const TitleBarButton: React.FC<{ onClick: () => void, children: React.ReactNode, className?: string }> = 
    ({ onClick, children, className = '' }) => (
    <button
      onClick={onClick}
      className={`title-bar-button h-8 w-12 flex justify-center items-center hover:bg-gray-700 ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="title-bar w-full h-8 bg-gray-800 flex justify-between items-center fixed top-0 left-0 z-50">
      <div className="flex-1 h-full flex items-center pl-2">   
      </div>
 
      <div className="flex h-full">
        <TitleBarButton onClick={handleMinimize}>
          <Minus color='#fff' size={16} />
        </TitleBarButton>
        <TitleBarButton onClick={handleMaximize}>
          {isMaximized ? <Copy color='#fff' size={16} /> : <Square color='#fff' size={16} />}
        </TitleBarButton>
        <TitleBarButton onClick={handleClose} className="hover:bg-red-500 hover:text-white">
          <X color='#fff' size={16} />
        </TitleBarButton>
      </div>
    </div>
  );
};