import React, { createContext, useContext, useState, useCallback } from 'react';
import { SimpleButton } from '../components/SimpleButton';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';

// Tipos de modal para ícones e cores
type ModalType = 'success' | 'error' | 'warning' | 'confirm';

// Opções para o nosso hook
interface ModalOptions {
  title: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// O que o nosso hook vai expor
interface ModalContextType {
  alert: (title: string, message: string, type?: 'success' | 'error' | 'warning') => Promise<void>;
  confirm: (title: string, message: string, options?: { confirmText?: string; type?: 'warning' | 'error' }) => Promise<boolean>;
}

// O Contexto
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Props para o Provedor
interface ModalProviderProps {
  children: React.ReactNode;
}

// Armazena as funções de callback da Promise
type PromiseCallbacks = {
  resolve: (value: boolean) => void;
};

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [callbacks, setCallbacks] = useState<PromiseCallbacks | null>(null);

  // Função para um ALERTA simples (só botão "OK")
  const alert = useCallback((title: string, message: string, type: 'success' | 'error' | 'warning' = 'warning') => {
    return new Promise<void>((resolve) => {
      setOptions({
        title,
        message,
        type,
        confirmText: 'OK',
        onConfirm: () => resolve(),
      });
      setCallbacks(null); // Não precisa de callbacks de booleano
      setIsOpen(true);
    });
  }, []);

  // Função para uma CONFIRMAÇÃO (retorna true/false)
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
      setCallbacks({ resolve }); // Armazena o callback da promise
      setIsOpen(true);
    });
  }, []);

  // Fecha o modal e chama o callback apropriado
  const handleClose = (callback?: () => void) => {
    setIsOpen(false);
    // Damos um pequeno delay para a animação de saída
    setTimeout(() => {
      callback?.();
      setOptions(null);
      setCallbacks(null);
    }, 200);
  };

  const handleConfirm = () => handleClose(options?.onConfirm);
  const handleCancel = () => handleClose(options?.onCancel);

  // Renderiza o ícone com base no tipo
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

      {/* --- O COMPONENTE MODAL EM SI --- */}
      {isOpen && options && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          // Animação de fade-in
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          {/* 1. Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={handleCancel}
          />
          
          {/* 2. Conteúdo do Modal */}
          <div 
            className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6"
            // Animação de slide-up
            style={{ animation: 'slideIn 0.2s ease-out' }}
          >
            <div className="flex items-start gap-4">
              {/* Ícone */}
              <div className="mt-1">
                {renderIcon(options.type || 'warning')}
              </div>
              
              {/* Textos */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {options.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
                  {options.message}
                </p>
              </div>

              {/* Botão de Fechar (opcional, só para 'alert') */}
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

      {/* Adiciona as animações ao CSS global */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateY(20px) scale(0.95); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
          }
        `}
      </style>
    </ModalContext.Provider>
  );
};

// Hook customizado para usar o modal
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal deve ser usado dentro de um ModalProvider');
  }
  return context;
};