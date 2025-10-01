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
  compact: "h-8 px-3 text-[0.68rem]",
  comfortable: "h-9 px-4 text-[0.76rem]",
};

export function Toolbar({ groups, density = "compact", className }: ToolbarProps) {
  return (
    <div
      role="toolbar"
      className={cn(
        "retro-toolbar flex w-full items-stretch gap-4 border px-3 py-2",
        className
      )}
    >
      {groups.map((group, index) => {
        if (!group.actions.length) return null;
        return (
          <div key={group.id} className="flex items-stretch gap-3">
            {index > 0 && <div className="retro-divider" aria-hidden="true" />}
            <div className="flex flex-col gap-1">
              {group.label && (
                <span className="px-1 text-[0.6rem] uppercase tracking-[0.24em] text-muted">
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
                        "inline-flex items-center gap-2 border border-transparent font-semibold uppercase tracking-[0.16em] text-subtle",
                        "transition duration-150 ease-out focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
                        densityStyles[density],
                        action.active
                          ? "border-[var(--accent)] bg-control-hover text-[var(--accent-muted-foreground)]"
                          : "hover:border-[var(--control-border)] hover:bg-control-hover",
                        disabled && "cursor-not-allowed opacity-50"
                      )}
                      title={action.description}
                    >
                      {action.icon && <span className="text-muted">{action.icon}</span>}
                      <span className="truncate">{action.label}</span>
                    </button>
                  );
                })}
              </div>
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
        "retro-window overflow-hidden",
        className
      )}
    >
      <div className="retro-window__chrome">
        <span className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 items-center justify-center border border-[var(--control-border-strong)] bg-[var(--accent, #3ba776)] text-[0.5rem] leading-none text-[var(--window-header-foreground)]">
            •
          </span>
          <span className="text-[0.72rem] uppercase tracking-[0.18em]">Ribbon Console</span>
        </span>
        {currentTab && (
          <span className="text-[0.6rem] uppercase tracking-[0.24em] text-muted">
            {currentTab.label}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 px-5 pb-5 pt-16">
        <div className="flex items-center gap-2 border-b border-dashed border-[var(--toolbar-border)] pb-2 text-[0.72rem] uppercase tracking-[0.18em] text-subtle">
          {tabs.map(tab => {
            const isActive = tab.id === currentTab?.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={cn(
                  "px-3 py-1.5 uppercase tracking-[0.18em] transition duration-150 ease-out",
                  "border border-transparent focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
                  isActive
                    ? "border-[var(--accent)] bg-control-hover text-[var(--accent-muted-foreground)]"
                    : "hover:border-[var(--control-border)] hover:bg-control-hover"
                )}
                onClick={() => handleSelect(tab.id)}
              >
                <span className="inline-flex items-center gap-2">
                  {tab.icon && <span className="text-muted">{tab.icon}</span>}
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
        {currentTab?.description && (
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-muted">
            {currentTab.description}
          </p>
        )}
        {currentTab ? (
          <Toolbar groups={currentTab.groups} density={density} />
        ) : (
          <div className="border border-dashed border-[var(--toolbar-border)] p-4 text-center text-[0.72rem] uppercase tracking-[0.18em] text-muted">
            No tab selected
          </div>
        )}
      </div>
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
