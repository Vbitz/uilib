import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";

type TabItem = {
  id: string;
  label: ReactNode;
  content: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

type TabsOrientation = "horizontal" | "vertical";

type TabsProps = {
  items: TabItem[];
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  className?: string;
  contentClassName?: string;
  orientation?: TabsOrientation;
  fitted?: boolean;
};

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
  contentClassName,
  orientation = "horizontal",
  fitted = false,
}: TabsProps) {
  if (items.length === 0) {
    return null;
  }
  const firstEnabledId = useMemo(() => {
    const enabled = items.find(item => !item.disabled);
    return enabled?.id ?? null;
  }, [items]);

  const [internalValue, setInternalValue] = useState<string | null>(defaultValue ?? firstEnabledId);

  useEffect(() => {
    if (defaultValue) return;
    if (!internalValue && firstEnabledId) {
      setInternalValue(firstEnabledId);
    }
  }, [defaultValue, firstEnabledId, internalValue]);

  const activeId = value ?? internalValue ?? firstEnabledId;
  const activeTab = items.find(item => item.id === activeId) ?? items[0];

  const setActive = (id: string) => {
    if (value == null) {
      setInternalValue(id);
    }
    onValueChange?.(id);
  };

  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "flex w-full gap-4",
        isVertical ? "flex-row" : "flex-col",
        className
      )}
    >
      <div
        role="tablist"
        aria-orientation={isVertical ? "vertical" : "horizontal"}
        className={cn(
          "flex rounded-md border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950",
          isVertical ? "flex-col" : "flex-row",
          fitted ? "w-full" : undefined
        )}
      >
        {items.map(item => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              id={`tab-${item.id}`}
              aria-selected={isActive}
              aria-controls={`tab-panel-${item.id}`}
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                setActive(item.id);
              }}
              className={cn(
                "group relative flex min-w-[120px] flex-1 items-center gap-2 rounded px-3 py-2 text-left text-sm transition",
                "hover:bg-[var(--accent-muted)] hover:text-[var(--accent-muted-foreground)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
                "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
                item.disabled && "cursor-not-allowed opacity-50",
                isActive
                  ? "bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)] shadow-inner"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              {item.icon && (
                <span className="text-base text-slate-400 group-hover:text-[var(--accent-muted-foreground)]">
                  {item.icon}
                </span>
              )}
              <span className="flex flex-1 flex-col gap-1">
                <span className="text-sm font-medium text-current">{item.label}</span>
                {item.description && (
                  <span className="text-xs text-slate-500 group-hover:text-slate-400">
                    {item.description}
                  </span>
                )}
              </span>
              {item.badge && (
                <span className="inline-flex items-center rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">
                  {item.badge}
                </span>
              )}
              <span
                className={cn(
                  "absolute inset-x-1 bottom-0 h-0.5 rounded-full transition",
                  isActive ? "bg-[var(--accent)]" : "bg-transparent"
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`tab-panel-${activeTab?.id ?? "panel"}`}
        aria-labelledby={activeTab ? `tab-${activeTab.id}` : undefined}
        className={cn(
          "flex-1 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm",
          "dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300",
          contentClassName
        )}
      >
        {activeTab?.content}
      </div>
    </div>
  );
}

export type { TabItem, TabsOrientation, TabsProps };
