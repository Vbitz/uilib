import { forwardRef, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "../utils/cn";

type SelectProps = {
  label?: string;
  description?: string;
  error?: string;
  startSlot?: ReactNode;
  endSlot?: ReactNode;
  placeholder?: string;
  fieldClassName?: string;
  selectClassName?: string;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  className?: string;
};

const ChevronDownIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 12 12"
    className="h-3 w-3 fill-current"
    focusable="false"
  >
    <path d="M2.22 4.72a.75.75 0 0 1 1.06 0L6 7.44l2.72-2.72a.75.75 0 1 1 1.06 1.06L6.53 9.03a.75.75 0 0 1-1.06 0L2.22 5.78a.75.75 0 0 1 0-1.06Z" />
  </svg>
);

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      id,
      label,
      description,
      error,
      startSlot,
      endSlot,
      placeholder,
      className,
      fieldClassName,
      selectClassName,
      disabled,
      children,
      value,
      defaultValue,
      ...rest
    },
    ref
  ) => {
    const selectId = id ?? rest.name;
    const isControlled = value !== undefined;
    const controlProps = isControlled
      ? { value }
      : defaultValue !== undefined
        ? { defaultValue }
        : placeholder !== undefined
          ? { defaultValue: "" }
          : {};

    return (
      <div className={cn("flex w-full flex-col gap-1", disabled && "opacity-60", className)}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-[0.6rem] uppercase tracking-[0.24em] text-muted"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "group/select relative flex w-full items-center gap-2 border border-[var(--control-border)] bg-[var(--control-bg)] px-3 py-2",
            "focus-within:border-[var(--accent)] focus-within:outline-double focus-within:outline-[var(--accent)] focus-within:outline-offset-2",
            error && "border-[#c94d63] focus-within:outline-[#c94d63]",
            disabled && "cursor-not-allowed bg-control",
            fieldClassName
          )}
        >
          {startSlot && <span className="text-muted">{startSlot}</span>}
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              "w-full border-0 bg-transparent text-[0.8rem] uppercase tracking-[0.18em] text-subtle outline-none",
              "appearance-none pr-6 ui-select-element",
              selectClassName
            )}
            {...controlProps}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {children}
          </select>
          <span className="pointer-events-none text-muted">
            {endSlot ?? <ChevronDownIcon />}
          </span>
        </div>
        {description && !error && (
          <p className="text-[0.6rem] uppercase tracking-[0.24em] text-muted">{description}</p>
        )}
        {error && <p className="text-[0.6rem] uppercase tracking-[0.24em] text-[#d06060]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export type { SelectProps };
