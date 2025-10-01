import { useCallback, useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { cn } from "../utils/cn";

type WindowState = "normal" | "maximized" | "minimized";

type WindowConnection = {
  sourceWindowId: string;
  targetWindowId: string;
  sourcePort: string;
  targetPort: string;
};

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
  state?: WindowState;
  onStateChange?: (state: WindowState) => void;
  showPorts?: boolean;
  inputs?: string[];
  outputs?: string[];
  onConnectionStart?: (windowId: string, port: string, isOutput: boolean) => void;
  onConnectionEnd?: (windowId: string, port: string) => void;
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
  state: externalState,
  onStateChange,
  showPorts = false,
  inputs = [],
  outputs = [],
  onConnectionStart,
  onConnectionEnd,
}: WindowProps) {
  // Detect if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>("");
  const [internalState, setInternalState] = useState<WindowState>("normal");
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number; startPosX: number; startPosY: number } | null>(null);
  const normalBoundsRef = useRef<{ position: { x: number; y: number }; size: { width: number; height: number } }>({
    position: initialPosition,
    size: initialSize,
  });

  const windowState = externalState ?? internalState;

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 'ontouchstart' in window;
      setIsMobile(mobile);
      
      // Auto-maximize on mobile on initial load
      if (mobile && windowState === "normal" && !externalState) {
        setInternalState("maximized");
        setPosition({ x: 0, y: 0 });
        setSize({ width: window.innerWidth, height: window.innerHeight });
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [externalState, windowState]);

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

  const handleResizeStart = useCallback((e: MouseEvent<HTMLDivElement>, direction: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    onFocus?.();
    
    setIsResizing(true);
    setResizeDirection(direction);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
      startPosX: position.x,
      startPosY: position.y,
    };
  }, [onFocus, size.width, size.height, position.x, position.y]);

  const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
    if (isDragging && dragRef.current) {
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;

      setPosition({
        x: Math.max(0, dragRef.current.startPosX + deltaX),
        y: Math.max(0, dragRef.current.startPosY + deltaY),
      });
    } else if (isResizing && resizeRef.current) {
      const deltaX = e.clientX - resizeRef.current.startX;
      const deltaY = e.clientY - resizeRef.current.startY;

      let newWidth = resizeRef.current.startWidth;
      let newHeight = resizeRef.current.startHeight;
      let newX = resizeRef.current.startPosX;
      let newY = resizeRef.current.startPosY;

      if (resizeDirection.includes("e")) {
        newWidth = Math.max(300, resizeRef.current.startWidth + deltaX);
      }
      if (resizeDirection.includes("w")) {
        const maxDelta = resizeRef.current.startWidth - 300;
        const constrainedDelta = Math.min(deltaX, maxDelta);
        newWidth = resizeRef.current.startWidth - constrainedDelta;
        newX = resizeRef.current.startPosX + constrainedDelta;
      }
      if (resizeDirection.includes("s")) {
        newHeight = Math.max(200, resizeRef.current.startHeight + deltaY);
      }
      if (resizeDirection.includes("n")) {
        const maxDelta = resizeRef.current.startHeight - 200;
        const constrainedDelta = Math.min(deltaY, maxDelta);
        newHeight = resizeRef.current.startHeight - constrainedDelta;
        newY = resizeRef.current.startPosY + constrainedDelta;
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    }
  }, [isDragging, isResizing, resizeDirection]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    dragRef.current = null;
    resizeRef.current = null;
  }, []);

  const toggleMaximize = useCallback(() => {
    const newState = windowState === "maximized" ? "normal" : "maximized";
    if (newState === "maximized") {
      normalBoundsRef.current = { position, size };
      setPosition({ x: 0, y: 0 });
      setSize({ width: window.innerWidth, height: window.innerHeight });
    } else {
      setPosition(normalBoundsRef.current.position);
      setSize(normalBoundsRef.current.size);
    }
    if (onStateChange) {
      onStateChange(newState);
    } else {
      setInternalState(newState);
    }
  }, [windowState, position, size, onStateChange]);

  const toggleMinimize = useCallback(() => {
    const newState = windowState === "minimized" ? "normal" : "minimized";
    if (onStateChange) {
      onStateChange(newState);
    } else {
      setInternalState(newState);
    }
  }, [windowState, onStateChange]);

  // Set up global mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Handle window resize for maximized windows
  useEffect(() => {
    if (windowState === "maximized") {
      const handleResize = () => {
        setSize({ width: window.innerWidth, height: window.innerHeight });
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [windowState]);

  if (windowState === "minimized") {
    return null;
  }

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
        
        {/* Window controls */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimize();
            }}
            className="flex h-4 w-4 items-center justify-center border border-[var(--window-header-border)] bg-[var(--control-bg)] text-[var(--subtle-foreground)] transition hover:bg-[var(--control-bg-hover)] hover:text-[var(--desktop-foreground)]"
            aria-label="Minimize"
            title="Minimize"
          >
            −
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMaximize();
            }}
            className="flex h-4 w-4 items-center justify-center border border-[var(--window-header-border)] bg-[var(--control-bg)] text-[var(--subtle-foreground)] transition hover:bg-[var(--control-bg-hover)] hover:text-[var(--desktop-foreground)]"
            aria-label={windowState === "maximized" ? "Restore" : "Maximize"}
            title={windowState === "maximized" ? "Restore" : "Maximize"}
          >
            {windowState === "maximized" ? "❐" : "□"}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex h-4 w-4 items-center justify-center border border-[var(--window-header-border)] bg-[var(--control-bg)] text-[var(--subtle-foreground)] transition hover:bg-[var(--control-bg-hover)] hover:text-[var(--desktop-foreground)]"
              aria-label="Close"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Window content */}
      <div className="flex-1 overflow-auto bg-[var(--window-bg)] p-4">
        {children}
      </div>

      {/* Connection Ports */}
      {showPorts && windowState !== "maximized" && (
        <>
          {/* Input ports on the left */}
          {inputs.map((input, index) => (
            <div
              key={`input-${input}`}
              className="absolute left-0 flex items-center"
              style={{
                top: `${50 + (index * 30)}px`,
                transform: "translateX(-50%)",
              }}
            >
              <div
                className="h-3 w-3 cursor-pointer rounded-full border-2 border-[var(--accent)] bg-[var(--window-bg)] transition hover:bg-[var(--accent)]"
                onClick={() => onConnectionEnd?.(id, input)}
                title={`Input: ${input}`}
              />
            </div>
          ))}
          
          {/* Output ports on the right */}
          {outputs.map((output, index) => (
            <div
              key={`output-${output}`}
              className="absolute right-0 flex items-center"
              style={{
                top: `${50 + (index * 30)}px`,
                transform: "translateX(50%)",
              }}
            >
              <div
                className="h-3 w-3 cursor-pointer rounded-full border-2 border-[var(--accent)] bg-[var(--window-bg)] transition hover:bg-[var(--accent)]"
                onMouseDown={() => onConnectionStart?.(id, output, true)}
                title={`Output: ${output}`}
              />
            </div>
          ))}
        </>
      )}

      {/* Resize handles */}
      {windowState !== "maximized" && !isMobile && (
        <>
          {/* Corner handles */}
          <div
            className="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          <div
            className="absolute bottom-0 left-0 h-3 w-3 cursor-nesw-resize"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="absolute top-0 right-0 h-3 w-3 cursor-nesw-resize"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="absolute top-0 left-0 h-3 w-3 cursor-nwse-resize"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          
          {/* Edge handles */}
          <div
            className="absolute bottom-0 left-3 right-3 h-1 cursor-ns-resize"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div
            className="absolute top-0 left-3 right-3 h-1 cursor-ns-resize"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div
            className="absolute left-0 top-3 bottom-3 w-1 cursor-ew-resize"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          <div
            className="absolute right-0 top-3 bottom-3 w-1 cursor-ew-resize"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
        </>
      )}
    </div>
  );
}

export type { WindowProps, WindowState, WindowConnection };
