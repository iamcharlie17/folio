'use client';

import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={16} className="text-green-600 shrink-0" />,
    error:   <AlertCircle  size={16} className="text-red-600 shrink-0" />,
    info:    <Info         size={16} className="text-[#B45309] shrink-0" />,
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-3 bg-white border border-[#E7E5E2] rounded-lg shadow-sm px-4 py-3 pointer-events-auto transition-all duration-200 animate-in slide-in-from-right-4"
          >
            {icons[t.type]}
            <p className="text-sm text-[#1C1B1A] flex-1 leading-snug">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-[#6B6A68] hover:text-[#1C1B1A] transition-colors shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
