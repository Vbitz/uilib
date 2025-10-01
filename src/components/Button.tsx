import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../utils/cn";

const variantStyles = {
  primary:
    "border-[var(--control-border-strong)] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)]",
  secondary:
    "border-[var(--control-border)] bg-[var(--control-bg)] text-subtle hover:bg-control-hover active:bg-[var(--control-bg)]",
  error:
    "border-[#8f1f32] bg-[#c62842] text-[#fffaf5] hover:bg-[#b9223b] active:bg-[#9f1d32]",
  warning:
    "border-[#9a6b2d] bg-[#c78f3c] text-[#1b1304] hover:bg-[#bb8432] active:bg-[#a87428]",
} as const;

type ButtonVariant = keyof typeof variantStyles;

const sizeStyles = {
  sm: "px-3 py-1.5 text-[0.72rem]",
  md: "px-4 py-2 text-[0.8rem]",
  lg: "px-5 py-2.5 text-[0.88rem]",
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
        "inline-flex items-center gap-2 border font-semibold uppercase tracking-[0.16em]",
        "rounded-none shadow-[0_1px_0_rgba(255,255,255,0.12)] transition duration-150 ease-out",
        "focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-40",
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
