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
          "retro-toolbar flex gap-1 border px-2 py-1",
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
                "group relative flex min-w-[120px] flex-1 items-center gap-2 border border-transparent px-3 py-2 text-left text-[0.74rem] uppercase tracking-[0.18em] transition duration-150 ease-out",
                "hover:border-[var(--control-border)] hover:bg-control-hover",
                "focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
                item.disabled && "cursor-not-allowed opacity-50",
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)]"
                  : "text-muted"
              )}
            >
              {item.icon && (
                <span className="text-base text-muted group-hover:text-[var(--accent-muted-foreground)]">
                  {item.icon}
                </span>
              )}
              <span className="flex flex-1 flex-col gap-1">
                <span className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-current">
                  {item.label}
                </span>
                {item.description && (
                  <span className="text-[0.58rem] uppercase tracking-[0.24em] text-muted group-hover:text-subtle">
                    {item.description}
                  </span>
                )}
              </span>
              {item.badge && (
                <span className="inline-flex items-center border border-[var(--control-border)] bg-control px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-muted">
                  {item.badge}
                </span>
              )}
              <span
                className={cn(
                  "absolute inset-x-1 bottom-0 h-0.5 bg-[var(--accent)] transition",
                  !isActive && "opacity-0"
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
          "flex-1 border border-[var(--control-border)] bg-[var(--window-bg)] p-5 text-[0.78rem] text-subtle shadow-[0_6px_18px_rgba(9,18,27,0.24)]",
          contentClassName
        )}
      >
        {activeTab?.content}
      </div>
    </div>
  );
}

export type { TabItem, TabsOrientation, TabsProps };
