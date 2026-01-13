
import React, { useEffect, useState } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'celebrate' | 'info';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'celebrate' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  return { toasts, showToast };
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[] }> = ({ toasts }) => {
  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[3000] flex flex-col items-center gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id}
          className={`px-8 py-3 rounded-2xl border flex items-center gap-3 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 ${
            toast.type === 'celebrate' 
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400 text-black font-black uppercase tracking-widest text-[10px]' 
              : 'bg-indigo-600 border-indigo-400 text-white font-black uppercase tracking-widest text-[10px]'
          }`}
        >
          {toast.type === 'celebrate' && <span className="text-xl animate-bounce">🎊</span>}
          {toast.text}
          {toast.type === 'celebrate' && <span className="text-xl animate-bounce">✨</span>}
        </div>
      ))}
    </div>
  );
};
