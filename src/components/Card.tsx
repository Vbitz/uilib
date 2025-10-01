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
  const chromeLabel = title ?? "Panel";

  return (
    <article
      className={cn(
        "retro-window overflow-hidden text-sm text-subtle",
        "backdrop-blur-[1px]",
        className
      )}
    >
      <div className="retro-window__chrome">
        <div className="flex items-center gap-2 truncate">
          <span className="inline-flex h-2 w-2 items-center justify-center border border-[var(--control-border-strong)] bg-[var(--accent, #3ba776)] text-[0.5rem] leading-none text-[var(--window-header-foreground)]">
            •
          </span>
          <span className="truncate">{chromeLabel}</span>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="flex flex-col gap-5 px-5 pb-6 pt-16">
        {description && (
          <p className="text-xs uppercase tracking-[0.26em] text-muted">{description}</p>
        )}
        <div className="flex flex-col gap-4 text-sm text-subtle">{children}</div>
      </div>
      {footer && (
        <footer className="border-t border-dashed border-[var(--toolbar-border)] bg-[var(--toolbar-bg)] px-5 py-3 text-[0.65rem] uppercase tracking-[0.24em] text-muted">
          {footer}
        </footer>
      )}
    </article>
  );
};

const chevronClasses =
  "h-3 w-3 text-muted transition-transform duration-200 group-data-[state=open]:rotate-90";

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
        <p className="text-[0.6rem] uppercase tracking-[0.24em] text-muted">{description}</p>
      ) : null,
    [description]
  );

  return (
    <section
      data-state={expanded ? "open" : "closed"}
      className={cn(
        "group border border-[var(--control-border)] bg-[var(--control-bg)] text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        "transition duration-200",
        disabled && "opacity-50",
        className
      )}
    >
      <header className="flex items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          id={labelId}
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            "inline-flex max-w-full flex-1 items-center gap-3 bg-transparent text-left font-medium",
            "focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-4",
            "text-[0.85rem] tracking-wide text-subtle"
          )}
        >
          <svg className={chevronClasses} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M7 5l6 5-6 5V5z" />
          </svg>
          <span className="truncate">{title}</span>
        </button>
        {actions && <div className="flex shrink-0 items-center gap-px text-xs uppercase tracking-[0.24em] text-muted">{actions}</div>}
      </header>
      {headerDescription && <div className="px-4 pb-3 text-[0.7rem] uppercase tracking-[0.24em] text-muted">{headerDescription}</div>}
      <div
        id={contentId}
        role="region"
        aria-labelledby={labelId}
        hidden={!expanded}
        className="px-4 pb-4 text-[0.85rem] text-subtle"
      >
        {children}
      </div>
    </section>
  );
};

const Card = Object.assign(CardRoot, { Section: CardSection });

export { Card, CardSection };
export type { CardProps, CardSectionProps };
