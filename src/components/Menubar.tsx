import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

type MenuSeparator = {
  id: string;
  kind: "separator";
};

type MenuAction = {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  description?: string;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void;
  kind?: "item";
};

type MenuSubmenu = {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  description?: string;
  disabled?: boolean;
  items: MenuEntry[];
  kind: "submenu";
};

type MenuEntry = MenuSeparator | MenuAction | MenuSubmenu;

type MenubarItem = {
  id: string;
  label: string;
  items: MenuEntry[];
};

type MenubarProps = {
  items: MenubarItem[];
  className?: string;
};

type ContextMenuProps = {
  items: MenuEntry[];
  children: ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
};

type MenuPanelProps = {
  items: MenuEntry[];
  onClose: () => void;
  style?: CSSProperties;
  level?: number;
};

function MenuPanel({ items, onClose, style, level = 0 }: MenuPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [submenuId, setSubmenuId] = useState<string | null>(null);

  useEffect(() => {
    const first = panelRef.current?.querySelector<HTMLButtonElement>(
      "button[data-menu-item=focusable]"
    );
    first?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    const node = panelRef.current;
    node?.addEventListener("keydown", onKey);
    return () => node?.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="menu"
      tabIndex={-1}
      style={style}
      className={cn(
        "z-50 min-w-[200px] rounded-md border border-slate-200 bg-white p-1 text-sm shadow-lg",
        "dark:border-slate-800 dark:bg-slate-950"
      )}
      onMouseLeave={() => setSubmenuId(null)}
    >
      {items.map(entry => {
        if (entry.kind === "separator") {
          return (
            <div
              key={entry.id}
              role="separator"
              className="my-1 border-t border-slate-200 dark:border-slate-800"
            />
          );
        }

        if (entry.kind === "submenu") {
          const disabled = Boolean(entry.disabled);
          const isOpen = submenuId === entry.id && !disabled;
          return (
            <div key={entry.id} className="relative">
              <button
                type="button"
                data-menu-item="focusable"
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded px-2 py-1.5 text-left",
                  "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
                  !disabled &&
                    "hover:bg-[var(--accent-muted)] hover:text-[var(--accent-muted-foreground)]",
                  disabled && "cursor-not-allowed text-slate-400 dark:text-slate-600"
                )}
                disabled={disabled}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                onMouseEnter={() => {
                  if (!disabled) setSubmenuId(entry.id);
                }}
                onClick={() => {
                  if (disabled) return;
                  setSubmenuId(prev => (prev === entry.id ? null : entry.id));
                }}
              >
                <span className="flex flex-col">
                  <span className="inline-flex items-center gap-2">
                    {entry.icon && <span className="text-slate-400">{entry.icon}</span>}
                    {entry.label}
                  </span>
                  {entry.description && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">{entry.description}</span>
                  )}
                </span>
                <span className="inline-flex items-center gap-2">
                  {entry.shortcut && (
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      {entry.shortcut}
                    </span>
                  )}
                  <span className="text-slate-400">›</span>
                </span>
              </button>
              {isOpen && (
                <MenuPanel
                  items={entry.items}
                  onClose={() => {
                    setSubmenuId(null);
                    onClose();
                  }}
                  level={level + 1}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "100%",
                    marginLeft: "0.25rem",
                  }}
                />
              )}
            </div>
          );
        }

        const disabled = Boolean(entry.disabled);
        return (
          <button
            key={entry.id}
            type="button"
            data-menu-item="focusable"
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              entry.onSelect?.();
              onClose();
            }}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded px-2 py-1.5 text-left",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
              "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
              entry.destructive
                ? "text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                : !disabled &&
                  "hover:bg-[var(--accent-muted)] hover:text-[var(--accent-muted-foreground)]",
              disabled && "cursor-not-allowed text-slate-400 dark:text-slate-600"
            )}
          >
            <span className="inline-flex items-center gap-2">
              {entry.icon && <span className="text-slate-400">{entry.icon}</span>}
              {entry.label}
            </span>
            {entry.shortcut && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                {entry.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Menubar({ items, className }: MenubarProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const triggersRef = useRef<Array<HTMLButtonElement | null>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const triggerClass = cn(
    "rounded-md px-2 py-1.5 text-sm font-medium text-slate-700",
    "transition-colors hover:bg-slate-100 hover:text-slate-900",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
    "focus-visible:ring-offset-white dark:text-slate-200 dark:hover:bg-slate-900/70 dark:hover:text-slate-100 dark:focus-visible:ring-offset-slate-950"
  );

  useEffect(() => {
    function onWindowClick(event: globalThis.MouseEvent) {
      const target = event.target as Node;
      if (containerRef.current && containerRef.current.contains(target)) return;
      setOpenId(null);
    }
    window.addEventListener("click", onWindowClick);
    return () => window.removeEventListener("click", onWindowClick);
  }, []);

  const visibleItems = useMemo(() => items.filter(Boolean), [items]);

  return (
    <div
      ref={containerRef}
      role="menubar"
      className={cn(
        "flex w-full items-center gap-2 border-b border-slate-200 bg-white px-2 py-1",
        "dark:border-slate-800 dark:bg-slate-950",
        className
      )}
      onMouseLeave={() => setOpenId(null)}
    >
      <ul className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
        {visibleItems.map((item, index) => (
          <li key={item.id} className="relative">
            <button
              ref={node => {
                triggersRef.current[index] = node;
              }}
              type="button"
              className={cn(triggerClass, openId === item.id && "bg-slate-200/70 dark:bg-slate-900/60")}
              aria-haspopup="menu"
              aria-expanded={openId === item.id}
              onMouseEnter={() => {
                if (openId) setOpenId(item.id);
              }}
              onClick={() => setOpenId(prev => (prev === item.id ? null : item.id))}
              onKeyDown={event => {
                if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setOpenId(item.id);
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  if (visibleItems.length > 0) {
                    const next = (index + 1) % visibleItems.length;
                    const nextItem = visibleItems[next];
                    if (nextItem) {
                      triggersRef.current[next]?.focus();
                      setOpenId(nextItem.id);
                    }
                  }
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  if (visibleItems.length > 0) {
                    const prev = (index - 1 + visibleItems.length) % visibleItems.length;
                    const prevItem = visibleItems[prev];
                    if (prevItem) {
                      triggersRef.current[prev]?.focus();
                      setOpenId(prevItem.id);
                    }
                  }
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  setOpenId(null);
                  triggersRef.current[index]?.focus();
                }
              }}
            >
              {item.label}
            </button>
            {openId === item.id && (
              <MenuPanel
                key={`${item.id}-menu`}
                items={item.items}
                onClose={() => setOpenId(null)}
                style={{ position: "absolute", top: "calc(100% + 0.25rem)", left: 0 }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContextMenu({ items, children, className, onOpenChange }: ContextMenuProps) {
  const [state, setState] = useState<{ open: boolean; x: number; y: number }>({
    open: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    if (!state.open) return;
    const close = () => {
      setState(prev => ({ ...prev, open: false }));
      onOpenChange?.(false);
    };
    window.addEventListener("click", close);
    window.addEventListener("contextmenu", close);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("contextmenu", close);
      window.removeEventListener("resize", close);
    };
  }, [onOpenChange, state.open]);

  const handleContextMenu = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setState({ open: true, x: event.clientX, y: event.clientY });
    onOpenChange?.(true);
  };

  return (
    <div className={className} onContextMenu={handleContextMenu} role="presentation">
      {children}
      {state.open && (
        <MenuPanel
          items={items}
          onClose={() => {
            setState(prev => ({ ...prev, open: false }));
            onOpenChange?.(false);
          }}
          style={{ position: "fixed", top: state.y, left: state.x }}
        />
      )}
    </div>
  );
}

export type {
  ContextMenuProps,
  MenuAction,
  MenuEntry,
  MenuSeparator,
  MenuSubmenu,
  MenubarItem,
  MenubarProps,
};
