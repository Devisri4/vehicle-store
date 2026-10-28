import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CircleCheck, TriangleAlert, X } from 'lucide-react';
import { destructiveButtonClass, primaryButtonClass, secondaryButtonClass } from '../components/ui.jsx';

// App-wide feedback: styled confirm dialogs (replacing window.confirm) and toast notifications.
//   const { confirm, toast } = useFeedback();
//   if (await confirm({ title, message, confirmLabel, destructive: true })) { ... }
//   toast('Saved.')  /  toast('Something failed.', 'error')

const FeedbackContext = createContext(null);
const TOAST_MS = 4500;

function ConfirmDialog({ title, message, confirmLabel = 'Confirm', destructive = false, onClose }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-fade-in bg-gray-900/50 backdrop-blur-sm" onClick={() => onClose(false)} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="relative w-full max-w-md animate-pop-in rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex gap-4">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              destructive ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-700'
            }`}
          >
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-base font-semibold text-gray-900">
              {title}
            </h2>
            {message && (
              <p id="confirm-message" className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-500">
                {message}
              </p>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button ref={cancelRef} type="button" onClick={() => onClose(false)} className={secondaryButtonClass}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onClose(true)}
            className={destructive ? destructiveButtonClass : primaryButtonClass}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toasts({ toasts, onDismiss }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6"
    >
      {toasts.map((t) => {
        const isError = t.type === 'error';
        const Icon = isError ? TriangleAlert : CircleCheck;
        return (
          <div
            key={t.id}
            role={isError ? 'alert' : 'status'}
            className="pointer-events-auto flex w-full animate-pop-in items-start gap-3 rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5 sm:w-96"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isError ? 'text-red-600' : 'text-emerald-600'}`} aria-hidden="true" />
            <p className="flex-1 text-sm font-medium text-gray-800">{t.text}</p>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((current) => current.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (text, type = 'success') => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => [...current, { id, text, type }]);
      setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss],
  );

  // The pending dialog's resolve function lives in a ref so closing never runs side effects inside setState
  const pendingResolve = useRef(null);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        pendingResolve.current?.(false);
        pendingResolve.current = resolve;
        setDialog(options);
      }),
    [],
  );

  const closeDialog = useCallback((result) => {
    pendingResolve.current?.(result);
    pendingResolve.current = null;
    setDialog(null);
  }, []);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {dialog && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          destructive={dialog.destructive}
          onClose={closeDialog}
        />
      )}
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  return useContext(FeedbackContext);
}
