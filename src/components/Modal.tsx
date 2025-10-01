import { useEffect, useId, useRef, type PropsWithChildren, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn";

type ModalSize = "sm" | "md" | "lg";

type ModalProps = PropsWithChildren<{
  open: boolean;
  onClose?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  className?: string;
  showCloseButton?: boolean;
  closeOnOverlay?: boolean;
}>;

const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  size = "md",
  className,
  children,
  showCloseButton = true,
  closeOnOverlay = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const baseId = useId();
  const titleId = title ? `${baseId}-title` : undefined;
  const descriptionId = description ? `${baseId}-description` : undefined;

  useEffect(() => {
    if (!open || typeof document === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    if (!node) return;
    const previouslyFocused = typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;
    node.focus({ preventScroll: true });
    return () => previouslyFocused?.focus?.({ preventScroll: true });
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  const portalTarget = document.body;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur"
      role="presentation"
      onClick={event => {
        if (!closeOnOverlay) return;
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        ref={dialogRef}
        className={cn(
          "w-full rounded-lg border border-slate-800 bg-slate-950 text-slate-200 shadow-xl outline-none",
          "dark:border-slate-700 dark:bg-slate-900",
          sizeStyles[size],
          className
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-800 px-5 py-4">
          <div className="flex flex-col gap-1">
            {title && (
              <h2 id={titleId} className="text-base font-semibold text-slate-100">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className="text-sm text-slate-400">
                {description}
              </p>
            )}
          </div>
          {showCloseButton && (
            <button
              type="button"
              onClick={() => onClose?.()}
              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 text-slate-400 transition hover:border-slate-600 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span className="sr-only">Close dialog</span>
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
                <path
                  d="M6.28 6.28a.75.75 0 011.06 0L10 8.94l2.66-2.66a.75.75 0 111.06 1.06L11.06 10l2.66 2.66a.75.75 0 01-1.06 1.06L10 11.06l-2.66 2.66a.75.75 0 01-1.06-1.06L8.94 10 6.28 7.34a.75.75 0 010-1.06z"
                  fill="currentColor"
                />
              </svg>
            </button>
          )}
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 text-sm text-slate-300">
          {children}
        </div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-slate-800 bg-slate-950/40 px-5 py-3 text-sm">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    portalTarget
  );
}

export type { ModalProps, ModalSize };
