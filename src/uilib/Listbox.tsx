import { useCallback, type KeyboardEvent } from "react";
import { cn } from "./utils/cn";

type ListboxOption = {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  disabled?: boolean;
};

type ListboxProps = {
  options: ListboxOption[];
  value: string | null;
  onChange?: (id: string) => void;
  className?: string;
  emptyState?: string;
};

function getNextEnabledIndex(options: ListboxOption[], startIndex: number, direction: 1 | -1) {
  let index = startIndex;
  for (let i = 0; i < options.length; i++) {
    index = (index + direction + options.length) % options.length;
    const option = options[index];
    if (option && !option.disabled) return index;
  }
  return startIndex;
}

export function Listbox({
  options,
  value,
  onChange,
  className,
  emptyState = "No items",
}: ListboxProps) {
  const activeIndex = options.findIndex(option => option.id === value);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!onChange || options.length === 0) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? (1 as 1 | -1) : (-1 as 1 | -1);
        const startIndex = activeIndex >= 0 ? activeIndex : direction === 1 ? -1 : 0;
        const nextIndex = getNextEnabledIndex(options, startIndex, direction);
        const nextOption = options[nextIndex];
        if (nextOption) {
          onChange(nextOption.id);
        }
      }
      if (event.key === "Home") {
        event.preventDefault();
        const firstEnabled = options.find(option => !option.disabled);
        if (firstEnabled) onChange(firstEnabled.id);
      }
      if (event.key === "End") {
        event.preventDefault();
        const reversed = [...options].reverse();
        const lastEnabled = reversed.find(option => !option.disabled);
        if (lastEnabled) onChange(lastEnabled.id);
      }
      if (event.key === "Enter" && activeIndex >= 0) {
        event.preventDefault();
        const current = options[activeIndex];
        if (current) {
          onChange(current.id);
        }
      }
    },
    [activeIndex, onChange, options, value]
  );

  return (
    <div
      role="listbox"
      tabIndex={0}
      className={cn(
        "flex w-full flex-col overflow-hidden border border-[var(--control-border)] bg-[var(--window-bg)] shadow-[0_8px_20px_rgba(9,18,27,0.28)]",
        className
      )}
      onKeyDown={handleKeyDown}
    >
      {options.length === 0 && (
        <div className="px-3 py-4 text-[0.72rem] uppercase tracking-[0.18em] text-muted">{emptyState}</div>
      )}
      {options.map(option => {
        const isSelected = option.id === value;
        return (
          <button
            key={option.id}
            role="option"
            data-state={isSelected ? "selected" : "idle"}
            aria-selected={isSelected}
            type="button"
            disabled={option.disabled}
            onClick={() => onChange?.(option.id)}
            className={cn(
              "flex w-full items-center justify-between border-b border-[var(--control-border)] px-3 py-2 text-left text-[0.74rem] uppercase tracking-[0.18em] last:border-b-0",
              "transition duration-150 ease-out",
              "hover:bg-control-hover",
              "focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
              option.disabled && "cursor-not-allowed opacity-50",
              isSelected && "border-[var(--accent)] bg-control-hover text-[var(--accent-muted-foreground)]",
              !option.disabled && isSelected && "shadow-inner"
            )}
          >
            <span className="flex flex-col">
              <span className="text-[0.74rem] font-semibold text-subtle">{option.label}</span>
              {option.description && (
                <span className="text-[0.58rem] uppercase tracking-[0.24em] text-muted">{option.description}</span>
              )}
            </span>
            {option.shortcut && (
              <span className="border border-[var(--control-border)] bg-control px-2 py-1 text-[0.6rem] uppercase tracking-[0.24em] text-muted">
                {option.shortcut}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export type { ListboxOption, ListboxProps };
