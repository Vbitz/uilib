import {
  useCallback,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

type CardProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
};

type CardSectionProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
};

const CardRoot = ({
  title,
  description,
  actions,
  footer,
  className,
  children,
}: CardProps) => {
  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
        "dark:border-slate-800 dark:bg-slate-950",
        className
      )}
    >
      {(title || description || actions) && (
        <header className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            {title && <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {description && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="text-sm text-slate-700 dark:text-slate-200">{children}</div>
      {footer && (
        <footer className="border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          {footer}
        </footer>
      )}
    </article>
  );
};

const chevronClasses = "h-3 w-3 text-slate-500 transition-transform group-data-[state=open]:rotate-90";

const CardSection = ({
  title,
  description,
  actions,
  children,
  className,
  open,
  defaultOpen = true,
  onOpenChange,
  disabled = false,
}: CardSectionProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const expanded = isControlled ? open : internalOpen;
  const labelId = useId();
  const contentId = useId();

  const handleToggle = useCallback(() => {
    if (disabled) return;
    const next = !expanded;
    if (!isControlled) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  }, [disabled, expanded, isControlled, onOpenChange]);

  const headerDescription = useMemo(
    () =>
      description ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      ) : null,
    [description]
  );

  return (
    <section
      data-state={expanded ? "open" : "closed"}
      className={cn(
        "group rounded-md border border-slate-200 bg-slate-50/80 text-sm",
        "transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/40",
        disabled && "opacity-60",
        className
      )}
    >
      <header className="flex items-center justify-between gap-2 px-3 py-2">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          id={labelId}
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            "inline-flex max-w-full flex-1 items-center gap-2 text-left font-medium text-slate-700",
            "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
            "focus-visible:ring-offset-white dark:text-slate-200 dark:focus-visible:ring-offset-slate-950"
          )}
        >
          <svg className={chevronClasses} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M7 5l6 5-6 5V5z" />
          </svg>
          <span className="truncate">{title}</span>
        </button>
        {actions && <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500">{actions}</div>}
      </header>
      {headerDescription && <div className="px-3 pb-2">{headerDescription}</div>}
      <div
        id={contentId}
        role="region"
        aria-labelledby={labelId}
        hidden={!expanded}
        className="px-3 pb-3 text-slate-600 dark:text-slate-300"
      >
        {children}
      </div>
    </section>
  );
};

const Card = Object.assign(CardRoot, { Section: CardSection });

export { Card, CardSection };
export type { CardProps, CardSectionProps };
