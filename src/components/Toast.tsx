import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

type ToastVariant = "default" | "success" | "warning" | "danger" | "info";

type ToastAction = {
  label: ReactNode;
  onSelect: () => void;
};

type ToastOptions = {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  action?: ToastAction;
  duration?: number | null;
  dismissible?: boolean;
  icon?: ReactNode;
};

type ToastRecord = Required<Pick<ToastOptions, "title">> & {
  id: string;
  description?: ReactNode;
  variant: ToastVariant;
  action?: ToastAction;
  duration: number | null;
  dismissible: boolean;
  icon?: ReactNode;
};

type ToastPlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

type ToastProviderProps = PropsWithChildren<{
  placement?: ToastPlacement;
  duration?: number;
  maxVisible?: number;
}>;

type ToastContextValue = {
  notify: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantStyles: Record<ToastVariant, string> = {
  default: "border-slate-700 bg-slate-900 text-slate-200",
  success: "border-emerald-500/50 bg-emerald-500/15 text-emerald-200",
  warning: "border-amber-500/50 bg-amber-500/15 text-amber-100",
  danger: "border-rose-500/50 bg-rose-500/15 text-rose-200",
  info: "border-cyan-500/50 bg-cyan-500/15 text-cyan-100",
};

const placementStyles: Record<ToastPlacement, string> = {
  "top-right": "top-6 right-6 items-end",
  "top-left": "top-6 left-6 items-start",
  "bottom-right": "bottom-6 right-6 items-end",
  "bottom-left": "bottom-6 left-6 items-start",
};

const generateId = () => `toast-${cryptoRandom()}`;

function cryptoRandom(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

export function ToastProvider({
  children,
  placement = "top-right",
  duration = 5000,
  maxVisible = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const clearTimer = useCallback((id: string) => {
    const timers = timersRef.current;
    const timer = timers.get(id);
    if (timer != null) {
      clearTimeout(timer);
      timers.delete(id);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    clearTimer(id);
  }, [clearTimer]);

  const dismissAll = useCallback(() => {
    setToasts([]);
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  const scheduleDismiss = useCallback(
    (toast: ToastRecord) => {
      if (toast.duration == null) return;
      if (typeof window === "undefined") return;
      clearTimer(toast.id);
      const timeoutId = window.setTimeout(() => dismiss(toast.id), toast.duration);
      timersRef.current.set(toast.id, timeoutId);
    },
    [clearTimer, dismiss]
  );

  const notify = useCallback(
    (options: ToastOptions) => {
      const id = options.id ?? generateId();
      const record: ToastRecord = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? "default",
        action: options.action,
        duration: options.duration ?? duration,
        dismissible: options.dismissible ?? true,
        icon: options.icon,
      };

      setToasts(prev => {
        const next = [...prev.filter(toast => toast.id !== id), record];
        if (next.length > maxVisible) {
          next.splice(0, next.length - maxVisible);
        }
        return next;
      });

      scheduleDismiss(record);

      return id;
    },
    [duration, maxVisible, scheduleDismiss]
  );

  useEffect(() => () => dismissAll(), [dismissAll]);

  const contextValue = useMemo<ToastContextValue>(() => ({ notify, dismiss, dismissAll }), [dismiss, dismissAll, notify]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastViewport toasts={toasts} placement={placement} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({
  toasts,
  placement,
  dismiss,
}: {
  toasts: ToastRecord[];
  placement: ToastPlacement;
  dismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  const placementClass = placementStyles[placement];

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[60] flex max-w-sm flex-col gap-3",
        placementClass
      )}
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastRecord;
  onDismiss: (id: string) => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const variantClass = variantStyles[toast.variant];

  return (
    <div
      role="status"
      aria-labelledby={titleId}
      aria-describedby={toast.description ? descriptionId : undefined}
      className={cn(
        "pointer-events-auto flex w-full items-start gap-3 rounded-lg border px-4 py-3 shadow-xl ring-1 ring-slate-900/20 backdrop-blur",
        variantClass
      )}
    >
      {toast.icon && (
        <div className="mt-0.5 text-lg text-current">{toast.icon}</div>
      )}
      <div className="flex flex-1 flex-col gap-1">
        <div id={titleId} className="text-sm font-semibold text-current">
          {toast.title}
        </div>
        {toast.description && (
          <div id={descriptionId} className="text-xs text-current/80">
            {toast.description}
          </div>
        )}
        {toast.action && (
          <button
            type="button"
            className="inline-flex w-fit items-center gap-1 rounded border border-current/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-current transition hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            onClick={() => {
              toast.action?.onSelect();
              onDismiss(toast.id);
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      {toast.dismissible && (
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-current/30 text-current/70 transition hover:text-current"
        >
          <span className="sr-only">Dismiss notification</span>
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5">
            <path
              d="M6.28 6.28a.75.75 0 011.06 0L10 8.94l2.66-2.66a.75.75 0 111.06 1.06L11.06 10l2.66 2.66a.75.75 0 01-1.06 1.06L10 11.06l-2.66 2.66a.75.75 0 01-1.06-1.06L8.94 10 6.28 7.34a.75.75 0 010-1.06z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return context;
}

export { type ToastOptions, type ToastVariant, type ToastPlacement };
