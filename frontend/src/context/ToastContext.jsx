import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 animate-fade-in ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/80 dark:border-emerald-900/50 dark:text-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/80 dark:border-rose-900/50 dark:text-rose-300'
                : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/80 dark:border-amber-900/50 dark:text-amber-300'
                : 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/80 dark:border-sky-900/50 dark:text-sky-300'
            }`}
          >
            <span className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
              {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-500" />}
              {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-500" />}
              {toast.type === 'info' && <Info className="h-5 w-5 text-sky-500" />}
            </span>
            <div className="flex-1 text-sm font-medium">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 rounded-lg p-0.5 hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
