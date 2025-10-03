import { useId, useMemo, useState, type ReactNode } from "react";
import { cn } from "./utils/cn";

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
              "overflow-hidden border border-[var(--control-border)] bg-[var(--window-bg)] shadow-[0_4px_16px_rgba(9,18,27,0.2)] transition",
              item.disabled && "opacity-60",
              itemClassName
            )}
            data-state={isOpen ? "open" : "collapsed"}
          >
            <button
              id={triggerId}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 text-left text-[0.78rem] uppercase tracking-[0.18em]",
                "transition duration-150 ease-out",
                "hover:bg-control-hover",
                "focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
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
              <span className="flex flex-shrink-0 items-center justify-center border border-[var(--control-border)] bg-control px-1.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-muted">
                {isOpen ? "OPEN" : "CLOSED"}
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="flex items-center gap-2 text-[0.78rem] font-semibold text-subtle">
                  {item.icon && <span className="text-base text-muted">{item.icon}</span>}
                  {item.title}
                </span>
                {item.description && (
                  <span className="text-[0.6rem] uppercase tracking-[0.24em] text-muted">
                    {item.description}
                  </span>
                )}
              </span>
              <svg
                viewBox="0 0 20 20"
                className={cn(
                  "h-4 w-4 text-muted transition-transform duration-200",
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
              className="border-t border-[var(--toolbar-border)] bg-control px-4 py-3 text-[0.78rem] text-subtle"
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
