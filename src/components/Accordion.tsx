import { useId, useMemo, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";

type AccordionEntry = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
};

type AccordionProps = {
  items: AccordionEntry[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (openItems: string[]) => void;
  type?: "single" | "multiple";
  collapsible?: boolean;
  className?: string;
  itemClassName?: string;
};

export function Accordion({
  items,
  value,
  defaultValue = [],
  onValueChange,
  type = "multiple",
  collapsible = true,
  className,
  itemClassName,
}: AccordionProps) {
  const baseId = useId();
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const openItems = value ?? internalValue;

  const normalized = useMemo(() => {
    const unique = new Map<string, AccordionEntry>();
    for (const item of items) {
      if (!unique.has(item.id)) {
        unique.set(item.id, item);
      }
    }
    return Array.from(unique.values());
  }, [items]);

  function setOpenItems(next: string[]) {
    if (!value) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  }

  function toggle(id: string) {
    if (type === "single") {
      const isOpen = openItems.includes(id);
      if (isOpen) {
        if (collapsible) {
          setOpenItems([]);
        }
        return;
      }
      setOpenItems([id]);
      return;
    }

    const isOpen = openItems.includes(id);
    setOpenItems(
      isOpen ? openItems.filter(itemId => itemId !== id) : [...openItems, id]
    );
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2",
        className
      )}
    >
      {normalized.map(item => {
        const isOpen = openItems.includes(item.id);
        const triggerId = `${baseId}-${item.id}-trigger`;
        const contentId = `${baseId}-${item.id}-content`;

        return (
          <section
            key={item.id}
            className={cn(
              "overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition",
              "dark:border-slate-800 dark:bg-slate-950",
              item.disabled && "opacity-60",
              itemClassName
            )}
            data-state={isOpen ? "open" : "collapsed"}
          >
            <button
              id={triggerId}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium",
                "transition-colors duration-150",
                "hover:bg-[var(--accent-muted)] hover:text-[var(--accent-muted-foreground)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
                "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
                item.disabled && "cursor-not-allowed hover:bg-transparent",
                !item.disabled && "cursor-pointer"
              )}
              aria-controls={contentId}
              aria-expanded={isOpen}
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                toggle(item.id);
              }}
            >
              <span className="flex flex-shrink-0 items-center justify-center rounded border border-transparent bg-[var(--accent-muted)] px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-muted-foreground)]">
                {isOpen ? "OPEN" : "CLOSED"}
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {item.icon && <span className="text-base text-slate-400">{item.icon}</span>}
                  {item.title}
                </span>
                {item.description && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.description}</span>
                )}
              </span>
              <svg
                viewBox="0 0 20 20"
                className={cn(
                  "h-4 w-4 text-slate-400 transition-transform duration-200",
                  isOpen ? "rotate-180" : "rotate-0"
                )}
                aria-hidden="true"
              >
                <path
                  d="M5.47 7.47a.75.75 0 011.06 0L10 10.94l3.47-3.47a.75.75 0 011.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 010-1.06z"
                  fill="currentColor"
                />
              </svg>
            </button>
            <div
              id={contentId}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
              className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
            >
              {item.content}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export type { AccordionEntry, AccordionProps };
