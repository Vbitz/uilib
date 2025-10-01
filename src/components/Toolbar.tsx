import { useEffect, useMemo, useState, type ReactNode } from "react";
import { cn } from "../utils/cn";

type ToolbarDensity = "compact" | "comfortable";

type ToolbarAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  description?: string;
};

type ToolbarGroup = {
  id: string;
  label?: string;
  actions: ToolbarAction[];
};

type ToolbarProps = {
  groups: ToolbarGroup[];
  density?: ToolbarDensity;
  className?: string;
};

type RibbonTab = {
  id: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  groups: ToolbarGroup[];
};

type RibbonProps = {
  tabs: RibbonTab[];
  activeTabId?: string;
  defaultTabId?: string;
  onTabChange?: (id: string) => void;
  density?: ToolbarDensity;
  className?: string;
};

const densityStyles: Record<ToolbarDensity, string> = {
  compact: "h-8 px-2 text-xs",
  comfortable: "h-9 px-3 text-sm",
};

export function Toolbar({ groups, density = "compact", className }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      className={cn(
        "flex w-full items-stretch gap-3 rounded-md border border-slate-200 bg-white px-2 py-1",
        "dark:border-slate-800 dark:bg-slate-950",
        className
      )}
    >
      {groups.map(group => {
        if (!group.actions.length) return null;
        return (
          <div key={group.id} className="flex flex-col gap-1">
            {group.label && (
              <span className="px-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {group.label}
              </span>
            )}
            <div className="flex items-center gap-1">
              {group.actions.map(action => {
                const disabled = Boolean(action.disabled);
                return (
                  <button
                    key={action.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (disabled) return;
                      action.onSelect?.();
                    }}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md border border-transparent font-medium text-slate-600",
                      "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
                      "focus-visible:ring-offset-white dark:text-slate-200 dark:focus-visible:ring-offset-slate-950",
                      densityStyles[density],
                      action.active
                        ? "bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)]"
                        : "hover:bg-slate-100 dark:hover:bg-slate-900/60",
                      disabled && "cursor-not-allowed opacity-60"
                    )}
                    title={action.description}
                  >
                    {action.icon && <span className="text-slate-400 dark:text-slate-500">{action.icon}</span>}
                    <span className="truncate">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Ribbon({
  tabs,
  activeTabId,
  defaultTabId,
  onTabChange,
  density = "compact",
  className,
}: RibbonProps) {
  const fallbackId = useMemo(() => tabs[0]?.id, [tabs]);
  const [internalTab, setInternalTab] = useState<string | undefined>(defaultTabId ?? fallbackId);

  useEffect(() => {
    if (activeTabId !== undefined) {
      setInternalTab(activeTabId);
    }
  }, [activeTabId]);

  useEffect(() => {
    if (internalTab === undefined && fallbackId) {
      setInternalTab(fallbackId);
    }
  }, [fallbackId, internalTab]);

  const currentTabId = activeTabId ?? internalTab ?? fallbackId;
  const currentTab = tabs.find(tab => tab.id === currentTabId) ?? tabs[0];

  const handleSelect = (id: string) => {
    if (activeTabId === undefined) {
      setInternalTab(id);
    }
    onTabChange?.(id);
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2",
        "dark:border-slate-800 dark:bg-slate-950",
        className
      )}
    >
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 text-sm dark:border-slate-800">
        {tabs.map(tab => {
          const isActive = tab.id === currentTab?.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={cn(
                "rounded-md px-3 py-1.5 font-medium",
                "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
                "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
                isActive
                  ? "bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)]"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900/60"
              )}
              onClick={() => handleSelect(tab.id)}
            >
              <span className="inline-flex items-center gap-2">
                {tab.icon && <span className="text-slate-400 dark:text-slate-500">{tab.icon}</span>}
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
      {currentTab?.description && (
        <p className="px-1 text-xs text-slate-500 dark:text-slate-400">{currentTab.description}</p>
      )}
      {currentTab ? (
        <Toolbar groups={currentTab.groups} density={density} />
      ) : (
        <div className="rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          No tab selected
        </div>
      )}
    </div>
  );
}

export type {
  RibbonProps,
  RibbonTab,
  ToolbarAction,
  ToolbarDensity,
  ToolbarGroup,
  ToolbarProps,
};
