import { useState, useEffect } from 'react';

export interface ToastProps {
  id?: string;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

type Listener = (toasts: ToastProps[]) => void;
let listeners: Listener[] = [];
let toasts: ToastProps[] = [];

export const toast = (props: ToastProps) => {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast = { ...props, id, type: props.type || 'info' };
  toasts = [...toasts, newToast];
  listeners.forEach((listener) => listener(toasts));

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((listener) => listener(toasts));
  }, props.duration || 4000);
};

export function Toaster() {
  const [activeToasts, setActiveToasts] = useState<ToastProps[]>([]);

  useEffect(() => {
    const handleToasts = (newToasts: ToastProps[]) => {
      setActiveToasts(newToasts);
    };
    listeners.push(handleToasts);
    return () => {
      listeners = listeners.filter((l) => l !== handleToasts);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {activeToasts.map((t) => (
        <div
          key={t.id}
          className={`p-4 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300 flex flex-col gap-1 border-opacity-40 select-none ${
            t.type === 'error'
              ? 'bg-red-950/90 border-red-800 text-red-200'
              : t.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-100'
          }`}
        >
          <div className="font-semibold text-sm">{t.title}</div>
          {t.description && <div className="text-xs opacity-90">{t.description}</div>}
        </div>
      ))}
    </div>
  );
}
