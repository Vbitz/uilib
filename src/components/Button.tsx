import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

const variantStyles = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)] focus-visible:ring-[var(--accent)] active:bg-[var(--accent-active)] active:shadow-sm",
  secondary:
    "bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-200 focus-visible:ring-slate-400 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 dark:active:bg-slate-700/90",
  error:
    "bg-rose-600 text-slate-50 hover:bg-rose-500 active:bg-rose-600/90 focus-visible:ring-rose-400",
  warning:
    "bg-amber-500 text-slate-900 hover:bg-amber-400 active:bg-amber-400/90 focus-visible:ring-amber-300",
} as const;

type ButtonVariant = keyof typeof variantStyles;

const sizeStyles = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
} as const;

type ButtonSize = keyof typeof sizeStyles;

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-transparent font-medium",
        "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "dark:focus-visible:ring-offset-slate-950",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled}
      {...props}
    />
  )
);

Button.displayName = "Button";

export type { ButtonProps, ButtonVariant, ButtonSize };
