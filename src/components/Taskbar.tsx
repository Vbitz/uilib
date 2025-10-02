import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type TaskbarItem = {
  id: string;
  title: string;
  icon?: ReactNode;
  state: "normal" | "maximized" | "minimized";
  focused: boolean;
  onFocus: () => void;
};

type TaskbarProps = {
  items: TaskbarItem[];
  className?: string;
  nodeViewMode?: boolean;
  onNodeViewToggle?: () => void;
};

export function Taskbar({ items, className, nodeViewMode = false, onNodeViewToggle }: TaskbarProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto fixed left-0 right-0 top-0 z-50 flex items-center gap-2 border-b border-[var(--toolbar-border)] bg-[var(--toolbar-bg)] px-3 py-2 shadow-sm",
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={item.onFocus}
          className={cn(
            "flex items-center gap-2 border border-[var(--control-border)] bg-[var(--control-bg)] px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.16em] transition",
            "hover:bg-[var(--control-bg-hover)]",
            item.focused && "border-[var(--accent)] bg-[var(--accent)] text-[var(--window-bg)]",
            item.state === "minimized" && "opacity-60"
          )}
        >
          {item.icon && (
            <div className="flex h-3 w-3 items-center justify-center">{item.icon}</div>
          )}
          <span className="font-semibold">{item.title}</span>
        </button>
      ))}

      {items.length === 0 && (
        <span className="rounded border border-dashed border-[var(--control-border)] bg-[var(--control-bg)] px-3 py-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-muted">
          No windows open
        </span>
      )}
      
      {/* Spacer */}
      <div className="flex-1" />
      
      {/* Node View Toggle */}
      {onNodeViewToggle && (
        <button
          type="button"
          onClick={onNodeViewToggle}
          className={cn(
            "flex items-center gap-2 border border-[var(--control-border)] bg-[var(--control-bg)] px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.16em] transition",
            "hover:bg-[var(--control-bg-hover)]",
            nodeViewMode && "border-[var(--accent)] bg-[var(--accent)] text-[var(--window-bg)]",
            !items.length && "opacity-60"
          )}
          title="Toggle Node View Mode"
          disabled={!items.length}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
            <circle cx="4" cy="4" r="2" />
            <circle cx="12" cy="4" r="2" />
            <circle cx="8" cy="12" r="2" />
            <line x1="6" y1="4" x2="10" y2="4" stroke="currentColor" strokeWidth="1.5" />
            <line x1="5" y1="6" x2="7" y2="10" stroke="currentColor" strokeWidth="1.5" />
            <line x1="11" y1="6" x2="9" y2="10" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className="font-semibold">Node View</span>
        </button>
      )}
    </div>
  );
}

export type { TaskbarItem, TaskbarProps };
