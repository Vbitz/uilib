import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { cn } from "./utils/cn";
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
        "flex w-full items-start justify-between gap-4 border border-transparent px-3 py-2 text-left text-[0.78rem] uppercase tracking-[0.18em]",
        "transition duration-150 ease-out focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
        active
          ? "border-[var(--accent)] bg-control-hover text-[var(--accent-muted-foreground)]"
          : "hover:border-[var(--control-border)] hover:bg-control-hover"
      )}
      onClick={onSelect}
    >
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-subtle">
          {highlightMatch(command.label, query)}
        </span>
        {command.description && (
          <span className="text-[0.6rem] uppercase tracking-[0.24em] text-muted">
            {command.description}
          </span>
        )}
      </div>
      {command.shortcut && (
        <span className="border border-[var(--control-border)] bg-control px-2 py-1 text-[0.6rem] uppercase tracking-[0.24em] text-muted">
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#040910]/85 p-6 backdrop-blur"
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      <div ref={containerRef} className="retro-window w-full max-w-3xl overflow-hidden">
        <div className="retro-window__chrome">
          <span className="flex items-center gap-2">
            <span className="inline-flex h-2 w-2 items-center justify-center border border-[var(--control-border-strong)] bg-[var(--accent, #3ba776)] text-[0.5rem] leading-none text-[var(--window-header-foreground)]">
              •
            </span>
            <span className="text-[0.72rem] uppercase tracking-[0.24em]">Command Console</span>
          </span>
          <span className="text-[0.6rem] uppercase tracking-[0.24em] text-muted">⌘K</span>
        </div>
        <div className="flex flex-col gap-3 px-5 pb-5 pt-16">
          <Textbox
            ref={inputRef}
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            startSlot={<span className="text-muted">⌘K</span>}
          />
          <div className="max-h-72 overflow-y-auto">
            {visibleCommands.length === 0 && (
              <p className="px-3 py-4 text-[0.72rem] uppercase tracking-[0.18em] text-muted">No commands found</p>
            )}
            {Array.from(sections.entries()).map(([section, commandsInSection]) => (
              <div key={section || "default"} className="flex flex-col gap-1">
                {section && (
                  <p className="px-3 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-muted">
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
          <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.24em] text-muted">
            <span>Use ↑ ↓ to navigate, Enter to run</span>
            <button
              type="button"
              className="border border-[var(--control-border)] bg-control px-2 py-1 text-[0.6rem] uppercase tracking-[0.24em] text-muted transition hover:border-[var(--accent)] hover:text-[var(--accent-muted-foreground)]"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { Command, CommandPaletteProps };
