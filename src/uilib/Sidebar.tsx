import { isValidElement, useState, type ReactNode } from "react";
import { cn } from "./utils/cn";

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
            "group inline-flex w-full items-center gap-2 border border-transparent px-3 py-2 text-left text-[0.74rem] uppercase tracking-[0.18em] transition duration-150 ease-out",
            "hover:border-[var(--control-border)] hover:bg-control-hover",
            "focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
            item.disabled && "cursor-not-allowed opacity-50",
            isActive && !isGroup &&
            "border-[var(--accent)] bg-control-hover text-[var(--accent-muted-foreground)]"
          )}
          aria-current={isActive && !isGroup ? "page" : undefined}
          aria-expanded={isGroup ? isExpanded : undefined}
          aria-haspopup={isGroup ? "true" : undefined}
        >
          {item.icon && (
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-[var(--control-border)] bg-control text-[0.7rem] text-muted">
              {item.icon}
            </span>
          )}
          {!collapsed && (
            <span className="flex flex-1 flex-col gap-0.5">
              <span className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-subtle group-hover:text-[var(--accent-muted-foreground)]">
                {item.label}
              </span>
              {item.description && (
                <span className="text-[0.58rem] uppercase tracking-[0.24em] text-muted group-hover:text-subtle">
                  {item.description}
                </span>
              )}
            </span>
          )}
          {!collapsed && item.badge && (
            <span className="ml-auto inline-flex items-center border border-[var(--control-border)] bg-control px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-muted">
              {item.badge}
            </span>
          )}
          {isGroup && !collapsed && (
            <svg
              className={cn(
                "h-3.5 w-3.5 text-muted transition-transform",
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
          <div className="mt-1 flex flex-col gap-1 border-l border-[var(--toolbar-border)] pl-3">
            {item.items!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  let headerText: string | undefined;
  if (typeof header === "string") {
    headerText = header;
  } else if (
    isValidElement<{ children?: ReactNode }>(header) &&
    typeof header.props.children === "string"
  ) {
    headerText = header.props.children;
  }

  const chromeTitle = headerText ?? "Navigator";

  return (
    <aside
      className={cn(
        "retro-window overflow-hidden",
        collapsed ? "w-[88px]" : "w-72",
        className
      )}
    >
      <div className="retro-window__chrome">
        <span className="flex items-center gap-2 truncate">
          <span className="inline-flex h-2 w-2 items-center justify-center border border-[var(--control-border-strong)] bg-[var(--accent, #3ba776)] text-[0.5rem] leading-none text-[var(--window-header-foreground)]">
            •
          </span>
          <span className="truncate text-[0.72rem] uppercase tracking-[0.24em]">
            {chromeTitle}
          </span>
        </span>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={() => onToggleCollapse(!collapsed)}
            className="inline-flex h-6 w-6 items-center justify-center border border-[var(--control-border)] bg-control text-muted transition hover:border-[var(--accent)] hover:text-[var(--accent-muted-foreground)] focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          >
            <span className="sr-only">Toggle sidebar</span>
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5">
              <path
                d="M12.5 5.5a.75.75 0 010 1.5H7.5a.75.75 0 010-1.5h5zM12.5 9.25a.75.75 0 010 1.5H7.5a.75.75 0 010-1.5h5zM13.25 13a.75.75 0 01-.75.75H7.5a.75.75 0 010-1.5h5a.75.75 0 01.75.75z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="flex h-full flex-col gap-3 px-4 pb-4 pt-16 text-subtle">
        {!collapsed && header && (
          <div className="text-[0.72rem] uppercase tracking-[0.24em] text-muted">
            {header}
          </div>
        )}
        <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
          {sections.map(section => (
            <div key={section.id} className="flex flex-col gap-2">
              {!collapsed && section.label && (
                <div className="px-1 text-[0.6rem] uppercase tracking-[0.24em] text-muted">
                  {section.label}
                </div>
              )}
              <div className="flex flex-col gap-1">
                {section.items.map(item => renderItem(item))}
              </div>
            </div>
          ))}
        </nav>
        {footer && (
          <div className="border-t border-dashed border-[var(--toolbar-border)] pt-3 text-[0.6rem] uppercase tracking-[0.24em] text-muted">
            {footer}
          </div>
        )}
      </div>
    </aside>
  );
}

export type { SidebarItem, SidebarProps, SidebarSection };
