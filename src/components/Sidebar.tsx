import { useState, type ReactNode } from "react";
import { cn } from "../utils/cn";

type SidebarItem = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  onSelect?: () => void;
  items?: SidebarItem[];
};

type SidebarSection = {
  id: string;
  label?: ReactNode;
  items: SidebarItem[];
};

type SidebarProps = {
  sections: SidebarSection[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: (next: boolean) => void;
};

function hasNestedItems(item: SidebarItem): boolean {
  return Array.isArray(item.items) && item.items.length > 0;
}

export function Sidebar({
  sections,
  selectedId,
  onSelect,
  header,
  footer,
  className,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [id]: !(prev[id] ?? true),
    }));
  };

  const renderItem = (item: SidebarItem, depth = 0) => {
    const isActive = selectedId === item.id;
    const isGroup = hasNestedItems(item);
    const isExpanded = expandedGroups[item.id] ?? true;

    return (
      <div key={item.id} className={cn("flex flex-col", depth > 0 && "pl-3")}
      >
        <button
          type="button"
          onClick={() => {
            if (item.disabled) return;
            if (isGroup && !collapsed) {
              toggleGroup(item.id);
            }
            if (!isGroup || collapsed) {
              item.onSelect?.();
              onSelect?.(item.id);
            }
          }}
          className={cn(
            "group inline-flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition",
            "hover:bg-[var(--accent-muted)] hover:text-[var(--accent-muted-foreground)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
            "focus-visible:ring-offset-slate-950",
            item.disabled && "cursor-not-allowed opacity-50",
            isActive && !isGroup && "bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)] shadow-inner"
          )}
          aria-current={isActive && !isGroup ? "page" : undefined}
          aria-expanded={isGroup ? isExpanded : undefined}
          aria-haspopup={isGroup ? "true" : undefined}
        >
          {item.icon && (
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-slate-800/50 bg-slate-900/40 text-[0.8rem] text-slate-400">
              {item.icon}
            </span>
          )}
          {!collapsed && (
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-sm font-medium text-slate-200 group-hover:text-[var(--accent-muted-foreground)]">
                {item.label}
              </span>
              {item.description && (
                <span className="text-xs text-slate-500 group-hover:text-slate-400">
                  {item.description}
                </span>
              )}
            </span>
          )}
          {!collapsed && item.badge && (
            <span className="ml-auto inline-flex items-center rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">
              {item.badge}
            </span>
          )}
          {isGroup && !collapsed && (
            <svg
              className={cn(
                "h-3.5 w-3.5 text-slate-500 transition-transform",
                isExpanded ? "rotate-90" : "rotate-0"
              )}
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M7.4 5.55a.75.75 0 011.16-.1l3.5 3.5a.75.75 0 010 1.1l-3.5 3.5a.75.75 0 11-1.06-1.06L10.04 10 7.5 7.56a.75.75 0 01-.1-1.15z" fill="currentColor" />
            </svg>
          )}
        </button>
        {isGroup && !collapsed && isExpanded && (
          <div className="mt-1 flex flex-col gap-1 border-l border-slate-800/40 pl-3">
            {item.items!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 shadow-inner",
        collapsed ? "w-[72px]" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between">
        {header}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={() => onToggleCollapse(!collapsed)}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-800 text-slate-400 transition hover:border-slate-700 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
              <path
                d="M12.5 5.5a.75.75 0 010 1.5H7.5a.75.75 0 010-1.5h5zM12.5 9.25a.75.75 0 010 1.5H7.5a.75.75 0 010-1.5h5zM13.25 13a.75.75 0 01-.75.75H7.5a.75.75 0 010-1.5h5a.75.75 0 01.75.75z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto">
        {sections.map(section => (
          <div key={section.id} className="flex flex-col gap-2">
            {!collapsed && section.label && (
              <div className="px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {section.label}
              </div>
            )}
            <div className="flex flex-col gap-1">
              {section.items.map(item => renderItem(item))}
            </div>
          </div>
        ))}
      </nav>
      {footer && <div className="border-t border-slate-800 pt-3 text-xs text-slate-400">{footer}</div>}
    </aside>
  );
}

export type { SidebarItem, SidebarProps, SidebarSection };
