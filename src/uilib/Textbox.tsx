import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "./utils/cn";

type TextboxProps = {
  label?: string;
  description?: string;
  error?: string;
  startSlot?: ReactNode;
  endSlot?: ReactNode;
  fieldClassName?: string;
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  className?: string;
};

export const Textbox = forwardRef<HTMLInputElement, TextboxProps>(
  (
    {
      id,
      label,
      description,
      error,
      startSlot,
      endSlot,
      className,
      fieldClassName,
      inputClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? props.name;
    return (
      <div className={cn("flex w-full flex-col gap-1", disabled && "opacity-60", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[0.6rem] uppercase tracking-[0.24em] text-muted"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "group/input flex w-full items-center gap-2 border border-[var(--control-border)] bg-[var(--control-bg)] px-3 py-2",
            "focus-within:border-[var(--accent)] focus-within:outline-double focus-within:outline-[var(--accent)] focus-within:outline-offset-2",
            error && "border-[#c94d63] focus-within:outline-[#c94d63]",
            disabled && "cursor-not-allowed bg-control",
            fieldClassName
          )}
        >
          {startSlot && <span className="text-muted">{startSlot}</span>}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              "w-full border-0 bg-transparent text-[0.8rem] uppercase tracking-[0.18em] text-subtle outline-none placeholder:text-muted",
              inputClassName
            )}
            {...props}
          />
          {endSlot && <span className="text-muted">{endSlot}</span>}
        </div>
        {description && !error && (
          <p className="text-[0.6rem] uppercase tracking-[0.24em] text-muted">{description}</p>
        )}
        {error && <p className="text-[0.6rem] uppercase tracking-[0.24em] text-[#d06060]">{error}</p>}
      </div>
    );
  }
);

Textbox.displayName = "Textbox";

export type { TextboxProps };
