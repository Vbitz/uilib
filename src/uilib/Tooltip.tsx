import {
  cloneElement,
  useEffect,
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "./utils/cn";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

type TooltipTriggerProps = {
  onMouseEnter?: HTMLAttributes<HTMLElement>["onMouseEnter"];
  onMouseLeave?: HTMLAttributes<HTMLElement>["onMouseLeave"];
  onFocus?: HTMLAttributes<HTMLElement>["onFocus"];
  onBlur?: HTMLAttributes<HTMLElement>["onBlur"];
  "aria-describedby"?: string;
} & Record<string, unknown>;

type TooltipProps = {
  label: ReactNode;
  children: ReactElement<TooltipTriggerProps>;
  delay?: number;
  placement?: TooltipPlacement;
  className?: string;
  sideOffset?: number;
};

const placementStyles: Record<TooltipPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 -translate-y-2",
  bottom: "top-full left-1/2 -translate-x-1/2 translate-y-2",
  left: "right-full top-1/2 -translate-y-1/2 -translate-x-2",
  right: "left-full top-1/2 -translate-y-1/2 translate-x-2",
};

const arrowPlacement: Record<TooltipPlacement, string> = {
  top: "top-full left-1/2 -translate-x-1/2",
  bottom: "bottom-full left-1/2 -translate-x-1/2 rotate-180",
  left: "left-full top-1/2 -translate-y-1/2 -rotate-90",
  right: "right-full top-1/2 -translate-y-1/2 rotate-90",
};

export function Tooltip({
  label,
  children,
  delay = 120,
  placement = "top",
  className,
  sideOffset = 8,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const clearTimers = () => {
    if (showTimer.current != null) {
      clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current != null) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const handleShow = () => {
    clearTimers();
    if (delay <= 0) {
      setVisible(true);
      return;
    }
    showTimer.current = setTimeout(() => setVisible(true), delay);
  };

  const handleHide = () => {
    clearTimers();
    hideTimer.current = setTimeout(() => setVisible(false), 80);
  };

  useEffect(() => () => clearTimers(), []);

  const existingDescribedBy = children.props["aria-describedby"] as string | undefined;

  const childProps: Partial<TooltipTriggerProps> = {
    onMouseEnter: event => {
      children.props.onMouseEnter?.(event);
      handleShow();
    },
    onMouseLeave: event => {
      children.props.onMouseLeave?.(event);
      handleHide();
    },
    onFocus: event => {
      children.props.onFocus?.(event);
      handleShow();
    },
    onBlur: event => {
      children.props.onBlur?.(event);
      handleHide();
    },
    "aria-describedby": visible
      ? existingDescribedBy
        ? `${existingDescribedBy} ${tooltipId}`.trim()
        : tooltipId
      : existingDescribedBy,
  };

  const styledChild = cloneElement(children, childProps);

  return (
    <span className="relative inline-flex">
      {styledChild}
      <span
        role="tooltip"
        id={tooltipId}
        data-visible={visible}
        className={cn(
          "pointer-events-none absolute z-20 inline-flex min-w-[140px] max-w-xs flex-col gap-1 border border-[var(--control-border)] bg-[var(--window-bg)] px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.24em] text-muted opacity-0 shadow-[0_10px_30px_rgba(9,18,27,0.35)] transition",
          "data-[visible=true]:opacity-100",
          placementStyles[placement],
          className
        )}
        style={{
          marginTop: placement === "bottom" ? sideOffset : placement === "top" ? sideOffset * -1 : 0,
          marginBottom: placement === "top" ? sideOffset : 0,
          marginLeft: placement === "right" ? sideOffset : placement === "left" ? sideOffset * -1 : 0,
          marginRight: placement === "left" ? sideOffset : 0,
        }}
      >
        {label}
        <span
          className={cn(
            "pointer-events-none absolute h-2 w-2 rotate-45 border border-[var(--control-border)] bg-[var(--window-bg)]",
            arrowPlacement[placement]
          )}
          aria-hidden="true"
        />
      </span>
    </span>
  );
}

export type { TooltipPlacement, TooltipProps };
