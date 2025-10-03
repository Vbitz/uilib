import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type StatusBarItemVariant = "default" | "info" | "success" | "warning" | "danger";

type StatusBarItem = {
  id: string;
  label: string;
  value?: string;
  icon?: ReactNode;
  hint?: string;
  align?: "start" | "end";
  variant?: StatusBarItemVariant;
  pulse?: boolean;
  onClick?: () => void;
};

type StatusBarProps = {
  items: StatusBarItem[];
  className?: string;
};

const valueVariantStyles: Record<StatusBarItemVariant, string> = {
  default: "text-[var(--desktop-foreground)]",
  info: "text-[var(--muted-foreground)]",
  success: "text-[var(--toast-success-foreground)]",
  warning: "text-[var(--toast-warning-foreground)]",
  danger: "text-[var(--toast-danger-foreground)]",
};

function PulseIndicator() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
    </span>
  );
}

function renderItemContent(item: StatusBarItem) {
  return (
    <>
      {item.pulse && <PulseIndicator />}
      {item.icon && <span className="text-[var(--muted-foreground)]">{item.icon}</span>}
      <span className="text-muted">{item.label}</span>
      {item.value && (
        <>
          <span className="text-muted">:</span>
          <span className={cn("font-semibold", valueVariantStyles[item.variant ?? "default"])}>
            {item.value}
          </span>
        </>
      )}
      {item.hint && (
        <span className="text-[0.58rem] uppercase tracking-[0.14em] text-muted">{item.hint}</span>
      )}
    </>
  );
}

function renderItem(item: StatusBarItem) {
  if (item.onClick) {
    return (
      <button
        key={item.id}
        type="button"
        onClick={item.onClick}
        className="inline-flex items-center gap-2 whitespace-nowrap rounded px-2 py-1 text-[var(--muted-foreground)] transition hover:bg-[var(--control-bg)]/70 hover:text-[var(--desktop-foreground)]"
        title={item.hint}
      >
        {renderItemContent(item)}
      </button>
    );
  }

  return (
    <span
      key={item.id}
      className="inline-flex items-center gap-2 whitespace-nowrap text-[var(--muted-foreground)]"
      title={item.hint}
    >
      {renderItemContent(item)}
    </span>
  );
}

export function StatusBar({ items, className }: StatusBarProps) {
  const startItems = items.filter(item => item.align !== "end");
  const endItems = items.filter(item => item.align === "end");

  return (
    <div
      className={cn(
        "pointer-events-auto fixed inset-x-0 bottom-0 z-50 border-t border-[var(--toolbar-border)] bg-[var(--toolbar-bg)]/95 px-4 py-2 backdrop-blur-sm",
        "text-[0.62rem] uppercase tracking-[0.18em]",
        className
      )}
    >
      <div className="flex items-center gap-4">
        {startItems.map(renderItem)}
        <div className="flex-1" />
        {endItems.map(renderItem)}
      </div>
    </div>
  );
}

export type { StatusBarItem, StatusBarProps, StatusBarItemVariant };
