import "./index.css";

import { useCallback, useMemo, useState } from "react";
import {
  Accordion,
  Button,
  Breadcrumb,
  Desktop,
  Listbox,
  Pagination,
  Table,
  Tabs,
  Taskbar,
  Textbox,
  ThemeProvider,
  ToastProvider,
  useToast,
  useTheme,
  Window,
  type DesktopIcon,
  type TableColumn,
  type WindowState,
} from "./components";

type Task = {
  name: string;
  status: "Backlog" | "In Progress" | "Review" | "Done";
  assignee: string;
  due: string;
};

const tasks: Task[] = [
  { name: "Authentication flow", status: "In Progress", assignee: "Casey", due: "Oct 12" },
  { name: "Telemetry dashboards", status: "Review", assignee: "Harper", due: "Oct 9" },
  { name: "Design tokens", status: "Backlog", assignee: "River", due: "Oct 23" },
  { name: "Command palette", status: "Done", assignee: "Kai", due: "Oct 3" },
];

const accentSwatches = [
  { name: "Indigo", value: "#4f46e5" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Cyan", value: "#06b6d4" },
];

const tableColumns: TableColumn<Task>[] = [
  { key: "name", header: "Task" },
  {
    key: "status",
    header: "Status",
    render: value => {
      const status = value as Task["status"];
      return (
        <span
          className="inline-flex border border-[var(--control-border)] bg-control px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-muted"
        >
          {status}
        </span>
      );
    },
  },
  { key: "assignee", header: "Owner" },
  { key: "due", header: "Due", align: "right" },
];

// Desktop icon components
const ButtonsIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="12" y="20" width="40" height="12" rx="2" fill="currentColor" opacity="0.8" />
    <rect x="12" y="36" width="40" height="12" rx="2" fill="currentColor" opacity="0.6" />
  </svg>
);

const FormsIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="12" y="12" width="40" height="8" rx="1" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    <rect x="12" y="26" width="40" height="8" rx="1" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    <rect x="12" y="40" width="40" height="8" rx="1" stroke="currentColor" strokeWidth="2" opacity="0.8" />
  </svg>
);

const TablesIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="10" y="10" width="44" height="44" stroke="currentColor" strokeWidth="2" />
    <line x1="10" y1="22" x2="54" y2="22" stroke="currentColor" strokeWidth="2" />
    <line x1="32" y1="22" x2="32" y2="54" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const NavigationIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="10" y="10" width="44" height="8" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="10" y="24" width="12" height="30" rx="1" fill="currentColor" opacity="0.6" />
    <rect x="26" y="24" width="28" height="30" rx="1" fill="currentColor" opacity="0.4" />
  </svg>
);

const ThemeIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <circle cx="32" cy="32" r="16" fill="currentColor" opacity="0.3" />
    <path d="M32 16 L32 48 M16 32 L48 32" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    <circle cx="32" cy="32" r="8" fill="currentColor" opacity="0.9" />
  </svg>
);

const WorkflowIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <circle cx="16" cy="32" r="6" fill="currentColor" opacity="0.8" />
    <circle cx="32" cy="20" r="6" fill="currentColor" opacity="0.8" />
    <circle cx="32" cy="44" r="6" fill="currentColor" opacity="0.8" />
    <circle cx="48" cy="32" r="6" fill="currentColor" opacity="0.8" />
    <line x1="22" y1="32" x2="26" y2="32" stroke="currentColor" strokeWidth="2" />
    <line x1="38" y1="32" x2="42" y2="32" stroke="currentColor" strokeWidth="2" />
    <line x1="28" y1="24" x2="32" y2="26" stroke="currentColor" strokeWidth="2" />
    <line x1="28" y1="40" x2="32" y2="38" stroke="currentColor" strokeWidth="2" />
  </svg>
);

function Workspace() {
  const { mode, toggleMode, setAccent } = useTheme();
  const { notify } = useToast();
  
  // Window management state
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set());
  const [focusedWindow, setFocusedWindow] = useState<string | null>(null);
  const [windowStates, setWindowStates] = useState<Record<string, WindowState>>({});
  
  const openWindow = useCallback((windowId: string) => {
    setOpenWindows(prev => new Set(prev).add(windowId));
    setFocusedWindow(windowId);
    setWindowStates(prev => ({ ...prev, [windowId]: "normal" }));
  }, []);
  
  const closeWindow = useCallback((windowId: string) => {
    setOpenWindows(prev => {
      const next = new Set(prev);
      next.delete(windowId);
      return next;
    });
    if (focusedWindow === windowId) {
      setFocusedWindow(null);
    }
  }, [focusedWindow]);

  const updateWindowState = useCallback((windowId: string, state: WindowState) => {
    setWindowStates(prev => ({ ...prev, [windowId]: state }));
    if (state === "normal" || state === "maximized") {
      setFocusedWindow(windowId);
    }
  }, []);

  const focusWindow = useCallback((windowId: string) => {
    setFocusedWindow(windowId);
    if (windowStates[windowId] === "minimized") {
      updateWindowState(windowId, "normal");
    }
  }, [windowStates, updateWindowState]);

  // Desktop icons configuration
  const desktopIcons = useMemo<DesktopIcon[]>(() => [
    {
      id: "buttons",
      label: "Buttons",
      icon: <ButtonsIcon />,
      onOpen: () => openWindow("buttons"),
    },
    {
      id: "forms",
      label: "Forms",
      icon: <FormsIcon />,
      onOpen: () => openWindow("forms"),
    },
    {
      id: "tables",
      label: "Tables",
      icon: <TablesIcon />,
      onOpen: () => openWindow("tables"),
    },
    {
      id: "navigation",
      label: "Navigation",
      icon: <NavigationIcon />,
      onOpen: () => openWindow("navigation"),
    },
    {
      id: "theme",
      label: "Theme",
      icon: <ThemeIcon />,
      onOpen: () => openWindow("theme"),
    },
    {
      id: "workflow",
      label: "Workflow",
      icon: <WorkflowIcon />,
      onOpen: () => openWindow("workflow"),
    },
  ], [openWindow]);

  // Generate taskbar items from open windows
  const taskbarItems = useMemo(() => {
    return Array.from(openWindows).map(windowId => {
      const windowConfig = desktopIcons.find(icon => icon.id === windowId);
      return {
        id: windowId,
        title: windowConfig?.label || windowId,
        icon: windowConfig?.icon,
        state: windowStates[windowId] || "normal",
        focused: focusedWindow === windowId,
        onFocus: () => focusWindow(windowId),
      };
    });
  }, [openWindows, desktopIcons, windowStates, focusedWindow, focusWindow]);

  return (
    <Desktop 
      icons={desktopIcons}
      taskbar={openWindows.size > 0 ? <Taskbar items={taskbarItems} /> : undefined}
    >
      {/* Buttons Window */}
      {openWindows.has("buttons") && (
        <Window
          id="buttons"
          title="Buttons"
          icon={<ButtonsIcon />}
          initialPosition={{ x: 50, y: 50 }}
          initialSize={{ width: 500, height: 400 }}
          onClose={() => closeWindow("buttons")}
          onFocus={() => focusWindow("buttons")}
          focused={focusedWindow === "buttons"}
          state={windowStates["buttons"]}
          onStateChange={(state) => updateWindowState("buttons", state)}
        >
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-[0.8rem] font-semibold uppercase tracking-wider text-subtle">
                Button Variants
              </h3>
              <p className="mb-4 text-[0.72rem] text-muted">
                Variants for primary workflows and alerts.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="error">Error</Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-[0.8rem] font-semibold uppercase tracking-wider text-subtle">
                Button Sizes
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
              </div>
            </div>
          </div>
        </Window>
      )}

      {/* Forms Window */}
      {openWindows.has("forms") && (
        <Window
          id="forms"
          title="Form Inputs"
          icon={<FormsIcon />}
          initialPosition={{ x: 100, y: 100 }}
          initialSize={{ width: 500, height: 450 }}
          onClose={() => closeWindow("forms")}
          onFocus={() => focusWindow("forms")}
          focused={focusedWindow === "forms"}
          state={windowStates["forms"]}
          onStateChange={(state) => updateWindowState("forms", state)}
        >
          <div className="space-y-4">
            <p className="text-[0.72rem] text-muted">Designed to match editor chrome.</p>
            <div className="space-y-3">
              <Textbox label="Repository" value="astra/nebula" onChange={() => {}} />
              <Textbox label="Owner" value="Casey Simmons" disabled onChange={() => {}} />
              <Textbox
                label="API Key"
                type="password"
                value="••••••••••••"
                onChange={() => {}}
                endSlot={<Button size="sm">Reveal</Button>}
              />
            </div>
          </div>
        </Window>
      )}

      {/* Tables Window */}
      {openWindows.has("tables") && (
        <Window
          id="tables"
          title="Data Tables"
          icon={<TablesIcon />}
          initialPosition={{ x: 150, y: 150 }}
          initialSize={{ width: 700, height: 450 }}
          onClose={() => closeWindow("tables")}
          onFocus={() => focusWindow("tables")}
          focused={focusedWindow === "tables"}
          state={windowStates["tables"]}
          onStateChange={(state) => updateWindowState("tables", state)}
        >
          <div className="space-y-3">
            <p className="text-[0.72rem] text-muted">Track delivery readiness across your engineering org.</p>
            <Table<Task>
              columns={tableColumns}
              data={tasks}
              striped
              density="comfortable"
            />
          </div>
        </Window>
      )}

      {/* Navigation Window */}
      {openWindows.has("navigation") && (
        <Window
          id="navigation"
          title="Navigation Components"
          icon={<NavigationIcon />}
          initialPosition={{ x: 200, y: 100 }}
          initialSize={{ width: 550, height: 500 }}
          onClose={() => closeWindow("navigation")}
          onFocus={() => focusWindow("navigation")}
          focused={focusedWindow === "navigation"}
          state={windowStates["navigation"]}
          onStateChange={(state) => updateWindowState("navigation", state)}
        >
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-[0.8rem] font-semibold uppercase tracking-wider text-subtle">
                Breadcrumb
              </h3>
              <Breadcrumb
                items={[
                  { id: "1", label: "Projects" },
                  { id: "2", label: "Nebula UI" },
                  { id: "3", label: "Components", active: true },
                ]}
              />
            </div>
            <div>
              <h3 className="mb-3 text-[0.8rem] font-semibold uppercase tracking-wider text-subtle">
                Pagination
              </h3>
              <Pagination page={2} pageCount={12} onPageChange={() => {}} siblings={1} />
            </div>
            <div>
              <h3 className="mb-3 text-[0.8rem] font-semibold uppercase tracking-wider text-subtle">
                Tabs
              </h3>
              <Tabs
                tabs={[
                  {
                    id: "overview",
                    label: "Overview",
                    description: "Main view",
                    content: <p className="text-[0.72rem] text-muted">Overview content goes here.</p>,
                  },
                  {
                    id: "details",
                    label: "Details",
                    description: "Detailed view",
                    content: <p className="text-[0.72rem] text-muted">Details content goes here.</p>,
                  },
                ]}
              />
            </div>
          </div>
        </Window>
      )}

      {/* Theme Window */}
      {openWindows.has("theme") && (
        <Window
          id="theme"
          title="Theme Settings"
          icon={<ThemeIcon />}
          initialPosition={{ x: 250, y: 150 }}
          initialSize={{ width: 450, height: 350 }}
          onClose={() => closeWindow("theme")}
          onFocus={() => focusWindow("theme")}
          focused={focusedWindow === "theme"}
          state={windowStates["theme"]}
          onStateChange={(state) => updateWindowState("theme", state)}
        >
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-[0.8rem] font-semibold uppercase tracking-wider text-subtle">
                Display Mode
              </h3>
              <Button onClick={toggleMode}>
                {mode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              </Button>
            </div>
            <div>
              <h3 className="mb-3 text-[0.8rem] font-semibold uppercase tracking-wider text-subtle">
                Accent Color
              </h3>
              <div className="flex flex-wrap gap-2">
                {accentSwatches.map((swatch) => (
                  <button
                    key={swatch.value}
                    type="button"
                    onClick={() => setAccent(swatch.value)}
                    className="h-12 w-12 border border-[var(--control-border)] transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(9,18,27,0.35)]"
                    style={{ backgroundColor: swatch.value }}
                    aria-label={`Use ${swatch.name} accent`}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-[0.8rem] font-semibold uppercase tracking-wider text-subtle">
                Notifications
              </h3>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    notify({
                      title: "Test notification",
                      description: "This is a test notification.",
                      variant: "info",
                    })
                  }
                >
                  Show Toast
                </Button>
              </div>
            </div>
          </div>
        </Window>
      )}

      {/* Workflow Window */}
      {openWindows.has("workflow") && (
        <Window
          id="workflow"
          title="Workflow Editor"
          icon={<WorkflowIcon />}
          initialPosition={{ x: 300, y: 80 }}
          initialSize={{ width: 600, height: 500 }}
          onClose={() => closeWindow("workflow")}
          onFocus={() => focusWindow("workflow")}
          focused={focusedWindow === "workflow"}
          state={windowStates["workflow"]}
          onStateChange={(state) => updateWindowState("workflow", state)}
        >
          <div className="space-y-4">
            <p className="text-[0.72rem] text-muted">
              Model node relationships and publish automation flows.
            </p>
            <div className="space-y-3">
              <h3 className="text-[0.8rem] font-semibold uppercase tracking-wider text-subtle">
                Available Components
              </h3>
              <ul className="space-y-2 text-[0.72rem]">
                <li className="flex items-center gap-2 border border-[var(--control-border)] bg-[var(--control-bg)] p-2">
                  <span className="font-semibold text-subtle">Node Editor</span>
                  <span className="text-muted">— Visual workflow designer</span>
                </li>
                <li className="flex items-center gap-2 border border-[var(--control-border)] bg-[var(--control-bg)] p-2">
                  <span className="font-semibold text-subtle">Tree View</span>
                  <span className="text-muted">— Hierarchical navigation</span>
                </li>
                <li className="flex items-center gap-2 border border-[var(--control-border)] bg-[var(--control-bg)] p-2">
                  <span className="font-semibold text-subtle">Toolbar</span>
                  <span className="text-muted">— Action grouping</span>
                </li>
                <li className="flex items-center gap-2 border border-[var(--control-border)] bg-[var(--control-bg)] p-2">
                  <span className="font-semibold text-subtle">Accordion</span>
                  <span className="text-muted">— Collapsible sections</span>
                </li>
              </ul>
            </div>
          </div>
        </Window>
      )}
    </Desktop>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Workspace />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
