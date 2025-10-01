import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";

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
      <div className={cn("flex w-full flex-col gap-1", disabled && "opacity-70", className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "group/input flex w-full items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-2",
            "focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]",
            "dark:border-slate-700 dark:bg-slate-900",
            error && "border-rose-500 focus-within:ring-rose-500",
            disabled && "cursor-not-allowed bg-slate-100 dark:bg-slate-800",
            fieldClassName
          )}
        >
          {startSlot && <span className="text-slate-500 dark:text-slate-400">{startSlot}</span>}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              "w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100",
              inputClassName
            )}
            {...props}
          />
          {endSlot && <span className="text-slate-500 dark:text-slate-400">{endSlot}</span>}
        </div>
        {description && !error && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        )}
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);

Textbox.displayName = "Textbox";

export type { TextboxProps };
