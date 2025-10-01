import { useCallback, useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { cn } from "../utils/cn";

type WindowProps = {
  id: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  onClose?: () => void;
  onFocus?: () => void;
  focused?: boolean;
  className?: string;
};

export function Window({
  id,
  title,
  icon,
  children,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 600, height: 400 },
  onClose,
  onFocus,
  focused = false,
  className,
}: WindowProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    
    e.stopPropagation();
    onFocus?.();
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  }, [onFocus, position.x, position.y]);

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (!isDragging || !dragRef.current) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    setPosition({
      x: Math.max(0, dragRef.current.startPosX + deltaX),
      y: Math.max(0, dragRef.current.startPosY + deltaY),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragRef.current = null;
  }, []);

  // Set up global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={cn(
        "retro-window pointer-events-auto absolute flex flex-col overflow-hidden",
        focused ? "z-10" : "z-0",
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      onClick={onFocus}
    >
      {/* Window header */}
      <div
        className="flex cursor-move items-center gap-2 border-b border-[var(--window-header-border)] bg-[var(--window-header-bg)] px-3 py-2 text-[0.72rem] uppercase tracking-[0.18em] text-[var(--window-header-foreground)]"
        onMouseDown={handleMouseDown}
      >
        {icon && <div className="flex h-4 w-4 items-center justify-center">{icon}</div>}
        <span className="flex-1 font-semibold">{title}</span>
        {onClose && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex h-4 w-4 items-center justify-center border border-[var(--window-header-border)] bg-[var(--control-bg)] text-[var(--subtle-foreground)] transition hover:bg-[var(--control-bg-hover)] hover:text-[var(--desktop-foreground)]"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      {/* Window content */}
      <div className="flex-1 overflow-auto bg-[var(--window-bg)] p-4">
        {children}
      </div>
    </div>
  );
}

export type { WindowProps };
