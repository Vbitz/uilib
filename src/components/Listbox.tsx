import { useCallback, type KeyboardEvent } from "react";
import { cn } from "../utils/cn";

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
        "flex w-full flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm",
        "dark:border-slate-800 dark:bg-slate-950",
        className
      )}
      onKeyDown={handleKeyDown}
    >
      {options.length === 0 && (
        <div className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">{emptyState}</div>
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
              "flex w-full items-center justify-between px-3 py-2 text-left text-sm",
              "transition-colors duration-150",
              "hover:bg-[var(--accent-muted)] hover:text-[var(--accent-muted-foreground)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
              "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
              option.disabled && "cursor-not-allowed text-slate-400 hover:bg-transparent dark:text-slate-600",
              isSelected && "bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)]",
              !option.disabled && isSelected && "shadow-inner shadow-[0_0_0_1px_var(--accent-muted)]"
            )}
          >
            <span className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              {option.description && (
                <span className="text-xs text-slate-500 dark:text-slate-400">{option.description}</span>
              )}
            </span>
            {option.shortcut && (
              <span className="rounded border border-slate-200 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
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
