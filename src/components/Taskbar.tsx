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
};

export function Taskbar({ items, className }: TaskbarProps) {
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
    </div>
  );
}

export type { TaskbarItem, TaskbarProps };
