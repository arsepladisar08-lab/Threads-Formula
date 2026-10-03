import React from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'info' | 'success' | 'error';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl border backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 duration-150 ${
            t.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/40'
              : t.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
              : 'bg-neutral-900/95 text-neutral-100 border-neutral-700'
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
};
