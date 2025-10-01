import type { ReactNode } from "react";
import { cn } from "../utils/cn";

type DesktopIcon = {
  id: string;
  label: string;
  icon: ReactNode;
  onOpen: () => void;
};

type DesktopProps = {
  icons: DesktopIcon[];
  children?: ReactNode;
  className?: string;
  taskbar?: ReactNode;
};

export function Desktop({ icons, children, className, taskbar }: DesktopProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-[var(--desktop-bg)] text-[var(--desktop-foreground)]",
        className
      )}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--desktop-grid) 1px, transparent 1px), linear-gradient(0deg, var(--desktop-grid) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* Taskbar */}
      {taskbar}

      {/* Desktop icons grid */}
      <div className={cn(
        "grid auto-rows-min grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-4 p-4 content-start",
        taskbar && "pt-16"
      )}>
        {icons.map((icon) => (
          <button
            key={icon.id}
            type="button"
            onClick={icon.onOpen}
            className={cn(
              "flex flex-col items-center gap-2 p-3 transition-all duration-150",
              "hover:bg-[var(--control-bg)]/50 hover:backdrop-blur-sm",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]",
              "active:scale-95"
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center text-[var(--desktop-foreground)]">
              {icon.icon}
            </div>
            <span className="text-center text-[0.7rem] font-medium leading-tight">
              {icon.label}
            </span>
          </button>
        ))}
      </div>

      {/* Windows layer */}
      <div className={cn(
        "pointer-events-none absolute inset-0 z-10",
        taskbar && "top-[42px]"
      )}>
        {children}
      </div>
    </div>
  );
}

export type { DesktopIcon, DesktopProps };
