import React, { createContext, useContext, useState, useCallback } from 'react';
import { SimpleButton } from '../components/SimpleButton';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';

type ModalType = 'success' | 'error' | 'warning' | 'confirm';

interface ModalOptions {
  title: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface ModalContextType {
  alert: (title: string, message: string, type?: 'success' | 'error' | 'warning') => Promise<void>;
  confirm: (title: string, message: string, options?: { confirmText?: string; type?: 'warning' | 'error' }) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
  children: React.ReactNode;
}

type PromiseCallbacks = {
  resolve: (value: boolean) => void;
};

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [_callbacks, setCallbacks] = useState<PromiseCallbacks | null>(null);

  const alert = useCallback((title: string, message: string, type: 'success' | 'error' | 'warning' = 'warning') => {
    return new Promise<void>((resolve) => {
      setOptions({
        title,
        message,
        type,
        confirmText: 'OK',
        onConfirm: () => resolve(),
      });
      setCallbacks(null);
      setIsOpen(true);
    });
  }, []);

  const confirm = useCallback((title: string, message: string, opts: { confirmText?: string; type?: 'warning' | 'error' } = {}) => {
    return new Promise<boolean>((resolve) => {
      setOptions({
        title,
        message,
        type: opts.type || 'confirm',
        confirmText: opts.confirmText || 'Confirmar',
        cancelText: 'Cancelar',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false),
      });
      setCallbacks({ resolve });
      setIsOpen(true);
    });
  }, []);

  const handleClose = (callback?: () => void) => {
    setIsOpen(false);
    setTimeout(() => {
      callback?.();
      setOptions(null);
      setCallbacks(null);
    }, 200);
  };

  const handleConfirm = () => handleClose(options?.onConfirm);
  const handleCancel = () => handleClose(options?.onCancel);

  const renderIcon = (type: ModalType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={28} className="text-green-500" />;
      case 'error':
        return <XCircle size={28} className="text-red-500" />;
      case 'warning':
      case 'confirm':
        return <AlertTriangle size={28} className="text-yellow-500" />;
      default:
        return <Info size={28} className="text-blue-500" />;
    }
  };

  return (
    <ModalContext.Provider value={{ alert, confirm }}>
      {children}

      {isOpen && options && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={handleCancel}
          />
          
          <div 
            className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6"
            style={{ animation: 'slideIn 0.2s ease-out' }}
          >
            <div className="flex items-start gap-4">

              <div className="mt-1">
                {renderIcon(options.type || 'warning')}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {options.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                  {options.message}
                </p>
              </div>

              {!options.cancelText && (
                 <button onClick={handleConfirm} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600">
                   <X size={20} />
                 </button>
              )}
            </div>
            
            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 mt-6">
              {options.cancelText && (
                <SimpleButton
                  title={options.cancelText}
                  onPress={handleCancel}
                />
              )}
              <SimpleButton
                title={options.confirmText || 'OK'}
                onPress={handleConfirm}
                className={
                  options.type === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
                  'bg-blue-600 text-white hover:bg-blue-700'
                }
              />
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal deve ser usado dentro de um ModalProvider');
  }
  return context;
};