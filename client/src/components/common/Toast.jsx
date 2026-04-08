import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const toneMap = {
  success: 'border-success/20 bg-success/10 text-success',
  error: 'border-danger/20 bg-danger/10 text-danger',
  info: 'border-brand/20 bg-brand/10 text-brand'
};

export const Toast = () => {
  const { toasts, removeToast } = useAppContext();

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-card border px-4 py-3 shadow-none animate-scale-in ${toneMap[toast.type || 'info']}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold text-copy">{toast.title}</p>
              <p className="mt-1 text-[13px] text-copyMuted">{toast.message}</p>
            </div>
            <button type="button" onClick={() => removeToast(toast.id)} className="text-copyMuted transition hover:text-copy">
              <X className="h-4 w-4" />
            </button>
          </div>
          {toast.onRetry ? (
            <button type="button" onClick={toast.onRetry} className="mt-3 text-[13px] font-semibold text-brand">
              Retry
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
};

