import "@xterm/xterm/css/xterm.css";

import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm, type ITerminalOptions, type ITheme } from "@xterm/xterm";

import { cn } from "../utils/cn";

type TerminalProps = {
  className?: string;
  options?: ITerminalOptions;
  content?: string | string[];
  onData?: (data: string) => void;
  autoFocus?: boolean;
};

export function Terminal({ className, options, content, onData, autoFocus = true }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const [ready, setReady] = useState(false);
  const lastContentRef = useRef<string | null>(null);

  const optionsRef = useRef<ITerminalOptions | undefined>(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const autoFocusRef = useRef(autoFocus);
  useEffect(() => {
    autoFocusRef.current = autoFocus;
  }, [autoFocus]);

  useEffect(() => {
    const baseTheme: ITheme = {
      background: "#0f1115",
      foreground: "#f8fafc",
      cursor: "#38bdf8",
      cursorAccent: "#020617",
      selectionBackground: "#1e293b",
      selectionForeground: "#f8fafc",
      black: "#020617",
      red: "#fb7185",
      green: "#58d58d",
      yellow: "#facc15",
      blue: "#60a5fa",
      magenta: "#c084fc",
      cyan: "#34d399",
      white: "#e2e8f0",
      brightBlack: "#1f2937",
      brightRed: "#f87171",
      brightGreen: "#86efac",
      brightYellow: "#fde68a",
      brightBlue: "#93c5fd",
      brightMagenta: "#e9d5ff",
      brightCyan: "#99f6e4",
      brightWhite: "#f8fafc",
    };

    const userOptions = optionsRef.current ?? {};
    const resolvedOptions: ITerminalOptions = {
      allowTransparency: true,
      convertEol: true,
      cursorBlink: true,
      fontFamily:
        "var(--font-mono, 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace)",
      fontSize: 13,
      lineHeight: 1.2,
      ...userOptions,
      theme: {
        ...baseTheme,
        ...(userOptions.theme ?? {}),
      },
    };

    const term = new XTerm(resolvedOptions);
    terminalRef.current = term;

    const container = containerRef.current;
    if (container) {
      term.open(container);
      lastContentRef.current = null;
      if (autoFocusRef.current) {
        term.focus();
      }
      setReady(true);
    }

    return () => {
      setReady(false);
      terminalRef.current = null;
      term.dispose();
    };
  }, []);

  useEffect(() => {
    if (!terminalRef.current || !onData) {
      return;
    }

    const disposable = terminalRef.current.onData(onData);
    return () => {
      disposable.dispose();
    };
  }, [onData]);

  useEffect(() => {
    if (!ready || !terminalRef.current || content === undefined) {
      return;
    }

    const term = terminalRef.current;
    const normalized = Array.isArray(content) ? content.join("\n") : content;

    if (normalized === lastContentRef.current) {
      return;
    }

    const sanitized = normalized.replace(/\r?\n/g, "\r\n");
    term.write("\x1b[2J\x1b[H");
    term.write(sanitized);
    term.scrollToBottom();
    lastContentRef.current = normalized;
  }, [content, ready]);

  return (
    <div className={cn("relative flex h-full w-full overflow-hidden", className)}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
