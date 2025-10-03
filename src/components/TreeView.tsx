import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

type TreeItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
  description?: string;
  disabled?: boolean;
  children?: TreeItem[];
};

type TreeViewProps = {
  items: TreeItem[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  expandedIds?: string[];
  defaultExpandedIds?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  className?: string;
  emptyState?: string;
};

type VisibleTreeItem = {
  item: TreeItem;
  level: number;
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
};

function collectVisibleItems(
  items: TreeItem[],
  expandedSet: Set<string>,
  level = 1,
  parentId: string | null = null,
  accumulator: VisibleTreeItem[] = []
): VisibleTreeItem[] {
  for (const item of items) {
    const hasChildren = Boolean(item.children && item.children.length > 0);
    const expanded = hasChildren ? expandedSet.has(item.id) : false;
    accumulator.push({ item, level, parentId, hasChildren, expanded });
    if (hasChildren && expanded) {
      collectVisibleItems(item.children!, expandedSet, level + 1, item.id, accumulator);
    }
  }
  return accumulator;
}

function getNextItem(
  currentId: string | null,
  visibleItems: VisibleTreeItem[],
  direction: 1 | -1
): VisibleTreeItem | undefined {
  if (!visibleItems.length) return undefined;
  const currentIndex = currentId
    ? visibleItems.findIndex(entry => entry.item.id === currentId)
    : -1;
  let index = currentIndex;
  for (let i = 0; i < visibleItems.length; i++) {
    index = (index + direction + visibleItems.length) % visibleItems.length;
    const candidate = visibleItems[index];
    if (candidate && !candidate.item.disabled) return candidate;
  }
  return undefined;
}

function getParentId(targetId: string | null, visibleItems: VisibleTreeItem[]): string | null {
  if (!targetId) return null;
  const match = visibleItems.find(entry => entry.item.id === targetId);
  return match ? match.parentId : null;
}

export function TreeView({
  items,
  selectedId = null,
  onSelect,
  expandedIds,
  defaultExpandedIds = [],
  onExpandedChange,
  className,
  emptyState = "No items",
}: TreeViewProps) {
  const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpandedIds);
  const expanded = expandedIds ?? internalExpanded;
  const expandedSet = useMemo(() => new Set(expanded), [expanded]);

  const visibleItems = useMemo(
    () => collectVisibleItems(items, expandedSet),
    [items, expandedSet]
  );

  const firstSelectable = useMemo(
    () => visibleItems.find(entry => !entry.item.disabled)?.item.id ?? null,
    [visibleItems]
  );

  const [activeId, setActiveId] = useState<string | null>(selectedId ?? firstSelectable);

  useEffect(() => {
    if (selectedId !== null) {
      setActiveId(selectedId);
    }
  }, [selectedId]);

  useEffect(() => {
    if (!activeId) {
      setActiveId(firstSelectable);
      return;
    }
    const stillVisible = visibleItems.some(entry => entry.item.id === activeId);
    if (!stillVisible) {
      setActiveId(firstSelectable);
    }
  }, [activeId, visibleItems, firstSelectable]);

  const setExpanded = (next: string[]) => {
    if (expandedIds !== undefined) {
      onExpandedChange?.(next);
      return;
    }
    setInternalExpanded(next);
    onExpandedChange?.(next);
  };

  const toggleExpanded = (id: string) => {
    setExpanded(
      expandedSet.has(id)
        ? expanded.filter(itemId => itemId !== id)
        : [...expanded, id]
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, entry: VisibleTreeItem) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? (1 as const) : (-1 as const);
      const next = getNextItem(activeId, visibleItems, direction);
      if (next) {
        setActiveId(next.item.id);
        if (!next.item.disabled) {
          document.getElementById(`treeitem-${next.item.id}`)?.focus();
        }
      }
    }

    if (event.key === "Home") {
      event.preventDefault();
      const first = visibleItems.find(item => !item.item.disabled);
      if (first) {
        setActiveId(first.item.id);
        document.getElementById(`treeitem-${first.item.id}`)?.focus();
      }
    }

    if (event.key === "End") {
      event.preventDefault();
      const reversed = [...visibleItems].reverse();
      const last = reversed.find(item => !item.item.disabled);
      if (last) {
        setActiveId(last.item.id);
        document.getElementById(`treeitem-${last.item.id}`)?.focus();
      }
    }

    if (event.key === "ArrowRight") {
      if (entry.hasChildren && !entry.expanded) {
        event.preventDefault();
        toggleExpanded(entry.item.id);
      } else if (entry.hasChildren && entry.expanded) {
        const next = getNextItem(entry.item.id, visibleItems, 1);
        if (next) {
          event.preventDefault();
          setActiveId(next.item.id);
          document.getElementById(`treeitem-${next.item.id}`)?.focus();
        }
      }
    }

    if (event.key === "ArrowLeft") {
      if (entry.hasChildren && entry.expanded) {
        event.preventDefault();
        toggleExpanded(entry.item.id);
      } else {
        const parentId = getParentId(entry.item.id, visibleItems);
        if (parentId) {
          event.preventDefault();
          setActiveId(parentId);
          document.getElementById(`treeitem-${parentId}`)?.focus();
        }
      }
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (entry.hasChildren && event.key === "Enter" && entry.item.children) {
        toggleExpanded(entry.item.id);
      }
      if (!entry.item.disabled) {
        onSelect?.(entry.item.id);
      }
    }
  };

  return (
    <div
      role="tree"
      aria-multiselectable={false}
      className={cn(
        "flex w-full min-h-0 flex-col overflow-x-hidden overflow-y-auto border border-[var(--control-border)] bg-[var(--window-bg)] text-[0.74rem] shadow-[0_10px_26px_rgba(9,18,27,0.28)]",
        className
      )}
    >
      {visibleItems.length === 0 && (
        <div className="px-3 py-4 text-[0.68rem] uppercase tracking-[0.18em] text-muted">{emptyState}</div>
      )}
      {visibleItems.map(entry => {
        const { item, level, hasChildren, expanded: isExpanded } = entry;
        const isSelected = selectedId === item.id;
        const isActive = activeId === item.id;
        const disabled = Boolean(item.disabled);
        const indent = (level - 1) * 1.5;

        return (
          <Fragment key={item.id}>
            <div className="relative flex items-stretch" style={{ paddingLeft: `${indent}rem` }}>
              {hasChildren && (
                <button
                  type="button"
                  className="mr-1 inline-flex h-7 w-7 flex-none items-center justify-center border border-[var(--control-border)] bg-control text-muted transition hover:border-[var(--accent)] hover:text-[var(--accent-muted-foreground)] focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                  aria-controls={`treeitem-${item.id}`}
                  aria-expanded={isExpanded}
                  onClick={() => toggleExpanded(item.id)}
                >
                  <svg
                    className={cn(
                      "h-3.5 w-3.5 text-current transition-transform",
                      isExpanded ? "rotate-90" : "rotate-0"
                    )}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M7 5l6 5-6 5V5z" />
                  </svg>
                </button>
              )}
              <button
                id={`treeitem-${item.id}`}
                role="treeitem"
                aria-level={level}
                aria-selected={isSelected}
                data-state={isSelected ? "selected" : "idle"}
                type="button"
                disabled={disabled}
                tabIndex={isActive && !disabled ? 0 : -1}
                onFocus={() => setActiveId(item.id)}
                onKeyDown={event => handleKeyDown(event, entry)}
                onClick={() => {
                  if (!disabled) {
                    onSelect?.(item.id);
                  }
                }}
                className={cn(
                  "group relative flex w-full items-center justify-between border-b border-[var(--control-border)] px-2 py-1.5 text-left uppercase tracking-[0.18em] last:border-b-0",
                  "transition duration-150 ease-out focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
                  !disabled && "hover:bg-control-hover",
                  isSelected && "border-[var(--accent)] bg-control-hover text-[var(--accent-muted-foreground)]",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                <span className="flex flex-col gap-0.5">
                  <span className="inline-flex items-center gap-2 font-semibold text-subtle">
                    {item.icon && <span className="text-muted">{item.icon}</span>}
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="text-[0.58rem] uppercase tracking-[0.24em] text-muted">{item.description}</span>
                  )}
                </span>
                {item.badge && (
                  <span className="ml-3 inline-flex items-center border border-[var(--control-border)] bg-control px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-muted">
                    {item.badge}
                  </span>
                )}
              </button>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

export type { TreeItem, TreeViewProps };
