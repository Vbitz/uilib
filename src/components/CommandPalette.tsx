import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { cn } from "../utils/cn";
import { Textbox } from "./Textbox";

type Command = {
  id: string;
  label: string;
  shortcut?: string;
  section?: string;
  keywords?: string[];
  description?: string;
  onSelect: () => void;
};

type CommandPaletteProps = {
  commands: Command[];
  open: boolean;
  onClose: () => void;
  searchPlaceholder?: string;
};

const highlightMatch = (text: string, query: string) => {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return text;
  return (
    <span>
      {text.slice(0, index)}
      <mark className="rounded bg-[var(--accent-muted)] px-0.5 text-[var(--accent-muted-foreground)]">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </span>
  );
};

const CommandRow = memo(
  ({
    command,
    active,
    onSelect,
    query,
  }: {
    command: Command;
    active: boolean;
    onSelect: () => void;
    query: string;
  }) => (
    <button
      type="button"
      className={cn(
        "flex w-full items-start justify-between gap-4 rounded-md px-3 py-2 text-left",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
        "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
        active
          ? "bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)]"
          : "hover:bg-[var(--accent-muted)] hover:text-[var(--accent-muted-foreground)]"
      )}
      onClick={onSelect}
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {highlightMatch(command.label, query)}
        </span>
        {command.description && (
          <span className="text-xs text-slate-500 dark:text-slate-400">{command.description}</span>
        )}
      </div>
      {command.shortcut && (
        <span className="rounded border border-slate-200 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {command.shortcut}
        </span>
      )}
    </button>
  )
);

CommandRow.displayName = "CommandRow";

export function CommandPalette({
  commands,
  open,
  onClose,
  searchPlaceholder = "Search commands…",
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      const timeout = window.setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey as any);
    return () => window.removeEventListener("keydown", onKey as any);
  }, [onClose, open]);

  const scoredCommands = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return commands;
    return commands
      .map(command => {
        const haystack = [command.label, command.description, ...(command.keywords ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const score = haystack.includes(term) ? haystack.indexOf(term) : Number.POSITIVE_INFINITY;
        return { command, score };
      })
      .filter(item => Number.isFinite(item.score))
      .sort((a, b) => a.score - b.score)
      .map(item => item.command);
  }, [commands, query]);

  const sections = useMemo(() => {
    const grouped = new Map<string, Command[]>();
    scoredCommands.forEach(command => {
      const key = command.section ?? "";
      grouped.set(key, [...(grouped.get(key) ?? []), command]);
    });
    return grouped;
  }, [scoredCommands]);

  const visibleCommands = scoredCommands;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!visibleCommands.length) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex(prev => (prev + 1) % visibleCommands.length);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex(prev => (prev - 1 + visibleCommands.length) % visibleCommands.length);
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const command = visibleCommands[activeIndex];
        if (command) {
          command.onSelect();
          onClose();
        }
      }
    },
    [activeIndex, onClose, visibleCommands]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={containerRef}
        className="flex w-full max-w-xl flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-950"
      >
        <Textbox
          ref={inputRef}
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          startSlot={<span className="text-slate-400">⌘K</span>}
        />
        <div className="max-h-72 overflow-y-auto">
          {visibleCommands.length === 0 && (
            <p className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">No commands found</p>
          )}
          {Array.from(sections.entries()).map(([section, commandsInSection]) => (
            <div key={section || "default"} className="flex flex-col gap-1">
              {section && (
                <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {section}
                </p>
              )}
              {commandsInSection.map(command => {
                const globalIndex = visibleCommands.indexOf(command);
                return (
                  <CommandRow
                    key={command.id}
                    command={command}
                    active={globalIndex === activeIndex}
                    query={query}
                    onSelect={() => {
                      command.onSelect();
                      onClose();
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Use ↑ ↓ to navigate, Enter to run</span>
          <button
            type="button"
            className="rounded border border-slate-200 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-500 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export type { Command, CommandPaletteProps };
