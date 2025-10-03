import "./index.css";

import { useCallback, useMemo, useState } from "react";
import {
  Accordion,
  Button,
  Breadcrumb,
  Card,
  CommandPalette,
  Desktop,
  Listbox,
  Menubar,
  Modal,
  Navbar,
  NodeEditor,
  Pagination,
  Ribbon,
  Sidebar,
  Table,
  Tabs,
  Taskbar,
  StatusBar,
  Select,
  Textbox,
  ThemeProvider,
  ToastProvider,
  Toolbar,
  Tooltip,
  TreeView,
  useToast,
  useTheme,
  Window,
  type DesktopIcon,
  type DesktopConnection,
  type EditorNode,
  type NodePaletteItem,
  type StatusBarItem,
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

const nodePalette: NodePaletteItem[] = [
  {
    type: "trigger",
    label: "HTTP Trigger",
    description: "Starts a workflow when an endpoint is called",
    badge: "Start",
    defaultSize: { width: 240, height: 148 },
    defaults: {
      status: "success",
      metadata: { method: "POST", retries: 0 },
    },
  },
  {
    type: "transform",
    label: "Transform",
    description: "Map inbound payload fields",
    defaultSize: { width: 220, height: 140 },
    defaults: {
      metadata: { template: "payload.json", latency: "12ms" },
    },
  },
  {
    type: "condition",
    label: "Branch",
    description: "Evaluate a conditional expression",
    badge: "Logic",
    defaultSize: { width: 240, height: 156 },
    defaults: {
      status: "warning",
      metadata: { rule: "priority > 7", outcomes: 2 },
    },
  },
  {
    type: "action",
    label: "Notify Team",
    description: "Send a message to the incident channel",
    defaultSize: { width: 240, height: 148 },
    defaults: {
      metadata: { channel: "#ship-room", provider: "Slack" },
    },
  },
  {
    type: "delay",
    label: "Delay",
    description: "Pause execution for a set duration",
    defaultSize: { width: 200, height: 132 },
    defaults: {
      metadata: { duration: "5m" },
    },
  },
];

const initialNodeEditorNodes: EditorNode[] = [
  {
    id: "node-start",
    label: "HTTP Trigger",
    description: "Receives deploy webhooks",
    position: { x: 96, y: 120 },
    status: "success",
    width: 240,
    height: 148,
    metadata: { method: "POST", path: "/deploy" },
  },
  {
    id: "node-run-tests",
    label: "Run Tests",
    description: "Execute CI suite",
    position: { x: 380, y: 120 },
    status: "default",
    width: 230,
    height: 140,
    metadata: { duration: "6m", flaky: "2" },
  },
  {
    id: "node-notify",
    label: "Notify Team",
    description: "Send summary to chat",
    position: { x: 640, y: 180 },
    status: "default",
    width: 240,
    height: 148,
    metadata: { channel: "#deployments" },
  },
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

const AccordionIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="12" y="16" width="40" height="8" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="12" y="28" width="40" height="8" rx="1" fill="currentColor" opacity="0.6" />
    <rect x="12" y="40" width="40" height="8" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="20" y="24" width="24" height="4" fill="currentColor" opacity="0.8" />
    <rect x="20" y="36" width="24" height="4" fill="currentColor" opacity="0.6" />
  </svg>
);

const CardsIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="14" y="18" width="32" height="22" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    <rect x="22" y="26" width="32" height="22" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.5" />
    <rect x="30" y="34" width="32" height="22" rx="2" stroke="currentColor" strokeWidth="2" opacity="0.3" />
  </svg>
);

const PaletteIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <circle cx="28" cy="32" r="16" stroke="currentColor" strokeWidth="2" opacity="0.7" />
    <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.8" />
    <circle cx="36" cy="24" r="3" fill="currentColor" opacity="0.6" />
    <circle cx="40" cy="34" r="3" fill="currentColor" opacity="0.8" />
    <circle cx="30" cy="40" r="3" fill="currentColor" opacity="0.6" />
    <path d="M36 48l10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
  </svg>
);

const ListboxIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="14" y="16" width="36" height="32" rx="2" stroke="currentColor" strokeWidth="2" />
    <rect x="20" y="22" width="24" height="4" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="20" y="30" width="24" height="4" rx="1" fill="currentColor" opacity="0.6" />
    <rect x="20" y="38" width="24" height="4" rx="1" fill="currentColor" opacity="0.4" />
  </svg>
);

const MenubarIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="12" y="18" width="40" height="6" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="12" y="28" width="10" height="4" rx="1" fill="currentColor" opacity="0.7" />
    <rect x="24" y="28" width="10" height="4" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="36" y="28" width="10" height="4" rx="1" fill="currentColor" opacity="0.3" />
  </svg>
);

const ModalIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="14" y="18" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    <rect x="18" y="22" width="28" height="6" rx="1" fill="currentColor" opacity="0.7" />
    <rect x="18" y="32" width="24" height="2" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="18" y="38" width="18" height="2" rx="1" fill="currentColor" opacity="0.4" />
  </svg>
);

const NavbarIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="12" y="18" width="40" height="8" rx="2" fill="currentColor" opacity="0.8" />
    <rect x="18" y="30" width="12" height="4" rx="1" fill="currentColor" opacity="0.7" />
    <rect x="32" y="30" width="12" height="4" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="18" y="38" width="24" height="4" rx="1" fill="currentColor" opacity="0.3" />
  </svg>
);

const SidebarIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="14" y="16" width="36" height="32" rx="2" stroke="currentColor" strokeWidth="2" />
    <rect x="18" y="16" width="10" height="32" rx="1" fill="currentColor" opacity="0.7" />
    <rect x="30" y="22" width="16" height="4" rx="1" fill="currentColor" opacity="0.6" />
    <rect x="30" y="30" width="16" height="4" rx="1" fill="currentColor" opacity="0.4" />
    <rect x="30" y="38" width="16" height="4" rx="1" fill="currentColor" opacity="0.3" />
  </svg>
);

const ToolbarIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="12" y="20" width="40" height="6" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="16" y="30" width="8" height="8" rx="1" fill="currentColor" opacity="0.7" />
    <rect x="28" y="30" width="8" height="8" rx="1" fill="currentColor" opacity="0.6" />
    <rect x="40" y="30" width="8" height="8" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="12" y="42" width="40" height="4" rx="1" fill="currentColor" opacity="0.3" />
  </svg>
);

const TooltipIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <rect x="16" y="20" width="32" height="18" rx="3" stroke="currentColor" strokeWidth="2" opacity="0.8" />
    <polygon points="28,38 36,38 32,46" fill="currentColor" opacity="0.6" />
    <rect x="20" y="24" width="24" height="4" rx="1" fill="currentColor" opacity="0.7" />
  </svg>
);

const TreeIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
    <circle cx="20" cy="20" r="4" fill="currentColor" opacity="0.7" />
    <circle cx="44" cy="20" r="4" fill="currentColor" opacity="0.7" />
    <circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.6" />
    <circle cx="20" cy="44" r="4" fill="currentColor" opacity="0.5" />
    <circle cx="44" cy="44" r="4" fill="currentColor" opacity="0.5" />
    <line x1="20" y1="24" x2="32" y2="28" stroke="currentColor" strokeWidth="2" />
    <line x1="44" y1="24" x2="32" y2="28" stroke="currentColor" strokeWidth="2" />
    <line x1="32" y1="36" x2="20" y2="40" stroke="currentColor" strokeWidth="2" />
    <line x1="32" y1="36" x2="44" y2="40" stroke="currentColor" strokeWidth="2" />
  </svg>
);

function Workspace() {
  const { mode, accent, toggleMode, setAccent } = useTheme();
  const { notify } = useToast();
  
  // Window management state
  const [openWindows, setOpenWindows] = useState<Set<string>>(new Set());
  const [focusedWindow, setFocusedWindow] = useState<string | null>(null);
  const [windowStates, setWindowStates] = useState<Record<string, WindowState>>({});
  const [nodeViewMode, setNodeViewMode] = useState(false);
  const [connections, setConnections] = useState<DesktopConnection[]>([]);
  const [nodeEditorNodes, setNodeEditorNodes] = useState<EditorNode[]>(() => initialNodeEditorNodes);
  const [listboxSelection, setListboxSelection] = useState<string | null>("pipeline-review");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarSelection, setSidebarSelection] = useState<string | null>("overview");
  const [repositoryVisibility, setRepositoryVisibility] = useState<"public" | "internal" | "private">(
    "internal"
  );
  const [menubarMessage, setMenubarMessage] = useState("Choose a command");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [lastCommand, setLastCommand] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [treeSelection, setTreeSelection] = useState<string | null>("folder-foundations");
  const [treeExpanded, setTreeExpanded] = useState<string[]>(["folder-foundations", "folder-components"]);
  const [activeRibbonTab, setActiveRibbonTab] = useState<string>("layout");

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
    if (windowId === "palette") {
      setCommandPaletteOpen(false);
    }
    if (windowId === "modal") {
      setModalOpen(false);
    }
    if (focusedWindow === windowId) {
      setFocusedWindow(null);
    }
  }, [focusedWindow, setCommandPaletteOpen, setModalOpen]);

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
      id: "accordion",
      label: "Accordion",
      icon: <AccordionIcon />,
      onOpen: () => openWindow("accordion"),
    },
    {
      id: "cards",
      label: "Cards",
      icon: <CardsIcon />,
      onOpen: () => openWindow("cards"),
    },
    {
      id: "palette",
      label: "Palette",
      icon: <PaletteIcon />,
      onOpen: () => openWindow("palette"),
    },
    {
      id: "listbox",
      label: "Listbox",
      icon: <ListboxIcon />,
      onOpen: () => openWindow("listbox"),
    },
    {
      id: "menubar",
      label: "Menubar",
      icon: <MenubarIcon />,
      onOpen: () => openWindow("menubar"),
    },
    {
      id: "modal",
      label: "Modal",
      icon: <ModalIcon />,
      onOpen: () => openWindow("modal"),
    },
    {
      id: "navbar",
      label: "Navbar",
      icon: <NavbarIcon />,
      onOpen: () => openWindow("navbar"),
    },
    {
      id: "sidebar",
      label: "Sidebar",
      icon: <SidebarIcon />,
      onOpen: () => openWindow("sidebar"),
    },
    {
      id: "toolbar",
      label: "Toolbar",
      icon: <ToolbarIcon />,
      onOpen: () => openWindow("toolbar"),
    },
    {
      id: "tooltip",
      label: "Tooltip",
      icon: <TooltipIcon />,
      onOpen: () => openWindow("tooltip"),
    },
    {
      id: "tree",
      label: "Tree",
      icon: <TreeIcon />,
      onOpen: () => openWindow("tree"),
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

  const windowLabelMap = useMemo(() => {
    return desktopIcons.reduce<Record<string, string>>((map, icon) => {
      map[icon.id] = icon.label;
      return map;
    }, {});
  }, [desktopIcons]);

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

  const focusedWindowLabel = focusedWindow ? windowLabelMap[focusedWindow] ?? focusedWindow : "Desktop";
  const openWindowCount = openWindows.size;

  const statusBarItems = useMemo<StatusBarItem[]>(() => {
    const accentSwatch = (
      <span
        className="inline-flex h-2.5 w-2.5 rounded-sm border border-[var(--control-border)]"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      />
    );

    return [
      {
        id: "workspace",
        label: "Workspace",
        value: "Nebula UI Library",
      },
      {
        id: "focus",
        label: "Focus",
        value: focusedWindowLabel,
        hint: openWindowCount === 0 ? "No windows open" : `${openWindowCount} open`,
        variant: focusedWindow ? "info" : "default",
      },
      {
        id: "node-mode",
        label: "Node View",
        value: nodeViewMode ? "Active" : "Off",
        variant: nodeViewMode ? "success" : "default",
        pulse: nodeViewMode,
      },
      {
        id: "connections",
        label: "Connections",
        value: connections.length.toString(),
        variant: connections.length ? "info" : "default",
        align: "end",
      },
      {
        id: "theme",
        label: "Theme",
        value: mode === "dark" ? "Dark" : "Light",
        align: "end",
      },
      {
        id: "accent",
        label: "Accent",
        value: accent.toUpperCase(),
        icon: accentSwatch,
        align: "end",
      },
    ];
  }, [accent, connections.length, focusedWindow, focusedWindowLabel, mode, nodeViewMode, openWindowCount]);

  const accordionItems = useMemo(
    () => [
      {
        id: "foundations",
        title: "Foundations",
        description: "Tokens, density, surfaces",
        content: (
          <div className="space-y-2">
            <p className="text-[0.72rem] text-muted">
              Configure typography, radius, and elevation tokens for the workspace theme.
            </p>
            <Button size="sm" variant="secondary">
              Edit tokens
            </Button>
          </div>
        ),
      },
      {
        id: "components",
        title: "Components",
        description: "Select enabled kits",
        content: (
          <ul className="list-inside list-disc space-y-1 text-[0.72rem] text-subtle">
            <li>Surface primitives</li>
            <li>Data display modules</li>
            <li>Navigation and chrome</li>
          </ul>
        ),
      },
      {
        id: "states",
        title: "States",
        description: "Interaction coverage",
        content: (
          <div className="space-y-2">
            <p className="text-[0.72rem] text-muted">
              Toggle resting, hover, focus, and disabled treatments for controls.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() =>
                  notify({
                    title: "Interaction tour queued",
                    description: "Cycle through simulated states to validate tokens.",
                    variant: "info",
                  })
                }
              >
                Play tour
              </Button>
              <Button size="sm" variant="secondary">
                Export spec
              </Button>
            </div>
          </div>
        ),
      },
    ],
    [notify]
  );

  const listboxOptions = useMemo(
    () => [
      {
        id: "pipeline-review",
        label: "Pipeline Review",
        description: "Inspect build output",
      },
      {
        id: "design-sync",
        label: "Design Sync",
        description: "Sync tokens from design kits",
        shortcut: "Shift+Cmd+D",
      },
      {
        id: "incident-response",
        label: "Incident Bridge",
        description: "Requires responder access",
        disabled: true,
      },
      {
        id: "release-readout",
        label: "Release Debrief",
        description: "Summarize latest release",
        shortcut: "Shift+Cmd+R",
      },
    ],
    []
  );

  const commandPaletteCommands = useMemo(
    () => [
      {
        id: "toggle-theme",
        label: mode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode",
        shortcut: "Cmd+T",
        section: "Workspace",
        description: "Flip the global theme",
        onSelect: () => {
          toggleMode();
          setLastCommand("Theme toggled");
        },
      },
      {
        id: "open-workflow",
        label: "Open Workflow Editor",
        shortcut: "Cmd+W",
        section: "Windows",
        description: "Launch the workflow canvas",
        onSelect: () => {
          openWindow("workflow");
          setLastCommand("Workflow window opened");
        },
      },
      {
        id: "toast",
        label: "Trigger Toast",
        section: "Debug",
        description: "Show a sample toast notification",
        onSelect: () => {
          notify({ title: "Sample toast", description: "Rendered via command palette", variant: "info" });
          setLastCommand("Toast triggered");
        },
      },
    ],
    [mode, notify, openWindow, toggleMode]
  );

  const menubarItems = useMemo(
    () => [
      {
        id: "workspace",
        label: "Workspace",
        items: [
          {
            id: "workspace-new",
            label: "New Window",
            shortcut: "Cmd+N",
            description: "Spawn a fresh testing window",
            onSelect: () => {
              setMenubarMessage("Created a testing window");
              notify({ title: "Window created", variant: "info" });
            },
          },
          { id: "workspace-sep", kind: "separator" as const },
          {
            id: "workspace-recent",
            label: "Recent",
            kind: "submenu" as const,
            items: [
              {
                id: "recent-theme",
                label: "Theme Settings",
                description: "Light/Dark and accent",
                onSelect: () => {
                  setMenubarMessage("Opened Theme Settings");
                  openWindow("theme");
                },
              },
              {
                id: "recent-workflow",
                label: "Workflow Editor",
                onSelect: () => {
                  setMenubarMessage("Opened Workflow Editor");
                  openWindow("workflow");
                },
              },
            ],
          },
          { id: "workspace-sep-2", kind: "separator" as const },
          {
            id: "workspace-exit",
            label: "Sign Out",
            shortcut: "Shift+Cmd+Q",
            destructive: true,
            onSelect: () => {
              setMenubarMessage("Signed out of workspace");
              notify({ title: "Signed out", variant: "warning" });
            },
          },
        ],
      },
      {
        id: "view",
        label: "View",
        items: [
          {
            id: "view-node",
            label: nodeViewMode ? "Hide Node Ports" : "Show Node Ports",
            shortcut: "Cmd+Option+N",
            onSelect: () => {
              setMenubarMessage(nodeViewMode ? "Node view disabled" : "Node view enabled");
              setNodeViewMode(prev => !prev);
            },
          },
          {
            id: "view-theme",
            label: mode === "light" ? "Enable Dark Mode" : "Enable Light Mode",
            shortcut: "Cmd+Shift+L",
            onSelect: () => {
              toggleMode();
              setMenubarMessage("Toggled app theme");
            },
          },
        ],
      },
    ],
    [mode, nodeViewMode, notify, openWindow, toggleMode]
  );

  const sidebarSections = useMemo(
    () => [
      {
        id: "overview",
        label: "Overview",
        items: [
          {
            id: "overview",
            label: "Overview",
            description: "Summary dashboard",
            icon: "OV",
            onSelect: () => setSidebarSelection("overview"),
          },
          {
            id: "activity",
            label: "Recent Activity",
            description: "Workspace events",
            icon: "EV",
            onSelect: () => setSidebarSelection("activity"),
          },
        ],
      },
      {
        id: "collections",
        label: "Collections",
        items: [
          {
            id: "foundations",
            label: "Foundations",
            description: "Core tokens",
            icon: "FN",
            items: [
              {
                id: "colors",
                label: "Colors",
                description: "Palette",
                onSelect: () => setSidebarSelection("colors"),
              },
              {
                id: "typography",
                label: "Typography",
                onSelect: () => setSidebarSelection("typography"),
              },
            ],
          },
          {
            id: "components",
            label: "Components",
            description: "UI building blocks",
            icon: "UI",
            items: [
              {
                id: "inputs",
                label: "Inputs",
                onSelect: () => setSidebarSelection("inputs"),
              },
              {
                id: "navigation",
                label: "Navigation",
                onSelect: () => setSidebarSelection("navigation"),
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const ribbonTabs = useMemo(
    () => [
      {
        id: "layout",
        label: "Layout",
        description: "Arrange spatial primitives",
        groups: [
          {
            id: "grid",
            label: "Grid",
            actions: [
              {
                id: "snap",
                label: "Toggle Snap",
                onSelect: () =>
                  notify({
                    title: "Snap toggled",
                    description: "Canvas snapping updated.",
                    variant: "info",
                  }),
              },
              {
                id: "rulers",
                label: "Show Rulers",
                onSelect: () =>
                  notify({
                    title: "Rulers shown",
                    description: "Guides enabled for layout tuning.",
                    variant: "info",
                  }),
              },
            ],
          },
          {
            id: "spacing",
            label: "Spacing",
            actions: [
              {
                id: "dense",
                label: "Dense",
              },
              {
                id: "comfortable",
                label: "Comfortable",
                active: true,
              },
            ],
          },
        ],
      },
      {
        id: "content",
        label: "Content",
        description: "Typography and copy",
        groups: [
          {
            id: "formatting",
            label: "Formatting",
            actions: [
              { id: "bold", label: "Bold", icon: <span className="font-semibold">B</span> },
              { id: "italic", label: "Italic", icon: <span className="italic">I</span> },
              { id: "code", label: "Code", icon: <span>{"</>"}</span> },
            ],
          },
          {
            id: "alignment",
            label: "Alignment",
            actions: [
              { id: "left", label: "Left" },
              { id: "center", label: "Center" },
              { id: "right", label: "Right" },
            ],
          },
        ],
      },
      {
        id: "preview",
        label: "Preview",
        description: "Validate runtime state",
        groups: [
          {
            id: "devices",
            label: "Devices",
            actions: [
              { id: "desktop", label: "Desktop", active: true },
              { id: "tablet", label: "Tablet" },
              { id: "mobile", label: "Mobile" },
            ],
          },
        ],
      },
    ],
    [notify]
  );

  const toolbarGroups = useMemo(
    () => [
      {
        id: "review",
        label: "Review",
        actions: [
          { id: "compare", label: "Compare" },
          { id: "comment", label: "Comment" },
        ],
      },
      {
        id: "distribution",
        label: "Distribute",
        actions: [
          {
            id: "share",
            label: "Share",
            onSelect: () =>
              notify({
                title: "Share panel opened",
                description: "Invite collaborators to edit this view.",
                variant: "info",
              }),
          },
          { id: "export", label: "Export" },
        ],
      },
    ],
    [notify]
  );

  const treeItems = useMemo(
    () => [
      {
        id: "folder-foundations",
        label: "Foundations",
        badge: "4",
        children: [
          { id: "token-color", label: "Color" },
          { id: "token-typography", label: "Typography" },
          { id: "token-radius", label: "Radii" },
          { id: "token-motion", label: "Motion" },
        ],
      },
      {
        id: "folder-components",
        label: "Components",
        badge: "12",
        children: [
          {
            id: "category-inputs",
            label: "Inputs",
            children: [
              { id: "component-button", label: "Button" },
              { id: "component-textbox", label: "Textbox" },
              { id: "component-listbox", label: "Listbox" },
            ],
          },
          {
            id: "category-navigation",
            label: "Navigation",
            children: [
              { id: "component-navbar", label: "Navbar" },
              { id: "component-sidebar", label: "Sidebar" },
            ],
          },
        ],
      },
      {
        id: "folder-patterns",
        label: "Patterns",
        badge: "5",
        children: [
          { id: "pattern-templates", label: "Templates" },
          { id: "pattern-workflows", label: "Workflows" },
        ],
      },
    ],
    []
  );

  const navbarLinks = useMemo(
    () => [
      { id: "dash", label: "Dashboard", active: true },
      { id: "library", label: "Component Library" },
      { id: "tokens", label: "Design Tokens" },
    ],
    []
  );

  // Define window ports for node view
  const windowPorts = {
    buttons: { inputs: [], outputs: ["click"] },
    forms: { inputs: ["data"], outputs: ["submit"] },
    tables: { inputs: ["data"], outputs: ["select"] },
    navigation: { inputs: [], outputs: ["navigate"] },
    accordion: { inputs: ["content"], outputs: ["toggle"] },
    cards: { inputs: ["content"], outputs: ["collapse"] },
    palette: { inputs: ["commands"], outputs: ["execute"] },
    listbox: { inputs: ["items"], outputs: ["select"] },
    menubar: { inputs: ["click"], outputs: ["action"] },
    modal: { inputs: ["open"], outputs: ["dismiss"] },
    navbar: { inputs: ["links"], outputs: ["navigate"] },
    sidebar: { inputs: ["items"], outputs: ["select"] },
    toolbar: { inputs: ["actions"], outputs: ["invoke"] },
    tooltip: { inputs: ["trigger"], outputs: ["hint"] },
    tree: { inputs: ["nodes"], outputs: ["select"] },
    theme: { inputs: [], outputs: ["theme-change"] },
    workflow: { inputs: ["trigger"], outputs: ["complete"] },
  };

  return (
    <>
      <Desktop
        icons={desktopIcons}
        taskbar={(
          <Taskbar
            items={taskbarItems}
            nodeViewMode={nodeViewMode}
            onNodeViewToggle={() => setNodeViewMode(!nodeViewMode)}
          />
        )}
        statusbar={<StatusBar items={statusBarItems} />}
        showConnections={nodeViewMode}
        connections={connections}
        onConnectionsChange={setConnections}
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
          showPorts={nodeViewMode}
          inputs={windowPorts.buttons.inputs}
          outputs={windowPorts.buttons.outputs}
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
          showPorts={nodeViewMode}
          inputs={windowPorts.forms.inputs}
          outputs={windowPorts.forms.outputs}
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
              <Select
                label="Visibility"
                description="Controls who can see this repository."
                value={repositoryVisibility}
                onChange={event =>
                  setRepositoryVisibility(event.target.value as "public" | "internal" | "private")
                }
              >
                <option value="public">Public</option>
                <option value="internal">Internal</option>
                <option value="private">Private</option>
              </Select>
              <Select label="Region" defaultValue="us-east" disabled>
                <option value="us-east">US East</option>
                <option value="us-west">US West</option>
                <option value="eu-central">EU Central</option>
              </Select>
            </div>
            <div className="rounded border border-dashed border-[var(--toolbar-border)] px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-muted">
              Selected visibility: {repositoryVisibility.charAt(0).toUpperCase() + repositoryVisibility.slice(1)}
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
          showPorts={nodeViewMode}
          inputs={windowPorts.tables.inputs}
          outputs={windowPorts.tables.outputs}
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
          showPorts={nodeViewMode}
          inputs={windowPorts.navigation.inputs}
          outputs={windowPorts.navigation.outputs}
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
                  { id: "3", label: "Components" },
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
                items={[
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

      {/* Accordion Window */}
      {openWindows.has("accordion") && (
        <Window
          id="accordion"
          title="Accordion Panels"
          icon={<AccordionIcon />}
          initialPosition={{ x: 320, y: 140 }}
          initialSize={{ width: 420, height: 360 }}
          onClose={() => closeWindow("accordion")}
          onFocus={() => focusWindow("accordion")}
          focused={focusedWindow === "accordion"}
          state={windowStates["accordion"]}
          onStateChange={state => updateWindowState("accordion", state)}
          showPorts={nodeViewMode}
          inputs={windowPorts.accordion.inputs}
          outputs={windowPorts.accordion.outputs}
        >
          <div className="space-y-4">
            <p className="text-[0.72rem] text-muted">
              Use accordions to group dense configuration details for reviewers.
            </p>
            <Accordion items={accordionItems} />
          </div>
        </Window>
      )}

      {/* Cards Window */}
      {openWindows.has("cards") && (
        <Window
          id="cards"
          title="Card Layouts"
          icon={<CardsIcon />}
          initialPosition={{ x: 120, y: 360 }}
          initialSize={{ width: 520, height: 420 }}
          onClose={() => closeWindow("cards")}
          onFocus={() => focusWindow("cards")}
          focused={focusedWindow === "cards"}
          state={windowStates["cards"]}
          onStateChange={state => updateWindowState("cards", state)}
          showPorts={nodeViewMode}
          inputs={windowPorts.cards.inputs}
          outputs={windowPorts.cards.outputs}
        >
          <div className="space-y-4">
            <p className="text-[0.72rem] text-muted">
              The card component packages chrome, expandable sections, and footers.
            </p>
            <Card
              title="Integration Checklist"
              description="Validate each step before shipping to production"
              footer="Last updated 2 minutes ago by Casey"
            >
              <Card.Section title="Authentication" description="OAuth client" actions={<span>3 steps</span>}>
                <ul className="list-inside list-disc space-y-1 text-[0.72rem]">
                  <li>Exchange staging credentials</li>
                  <li>Record redirect URIs</li>
                  <li>Capture consent screenshots</li>
                </ul>
              </Card.Section>
              <Card.Section title="Observability" description="Ensure instrumentation" defaultOpen={false}>
                <div className="space-y-2 text-[0.72rem]">
                  <p className="text-muted">Enable tracing for error and latency signals.</p>
                  <Button size="sm">Configure exporters</Button>
                </div>
              </Card.Section>
            </Card>
          </div>
        </Window>
      )}

      {/* Command Palette Window */}
      {openWindows.has("palette") && (
        <Window
          id="palette"
          title="Command Palette"
          icon={<PaletteIcon />}
          initialPosition={{ x: 520, y: 360 }}
          initialSize={{ width: 480, height: 300 }}
          onClose={() => closeWindow("palette")}
          onFocus={() => focusWindow("palette")}
          focused={focusedWindow === "palette"}
          state={windowStates["palette"]}
          onStateChange={state => updateWindowState("palette", state)}
          showPorts={nodeViewMode}
          inputs={windowPorts.palette.inputs}
          outputs={windowPorts.palette.outputs}
        >
          <div className="space-y-4">
            <p className="text-[0.72rem] text-muted">
              Surface workspace actions with fuzzy search and keyboard shortcuts.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => setCommandPaletteOpen(true)}>Open Palette</Button>
              <Button variant="secondary" size="sm" onClick={() => setCommandPaletteOpen(true)}>
                Simulate Cmd+K
              </Button>
              <Button size="sm" onClick={() => setLastCommand(null)}>
                Clear last command
              </Button>
            </div>
            <div className="rounded border border-[var(--control-border)] bg-control px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-muted">
              Last command: {lastCommand ?? "None yet"}
            </div>
          </div>
        </Window>
      )}

      {/* Listbox Window */}
      {openWindows.has("listbox") && (
        <Window
          id="listbox"
          title="Listbox"
          icon={<ListboxIcon />}
          initialPosition={{ x: 660, y: 160 }}
          initialSize={{ width: 360, height: 320 }}
          onClose={() => closeWindow("listbox")}
          onFocus={() => focusWindow("listbox")}
          focused={focusedWindow === "listbox"}
          state={windowStates["listbox"]}
          onStateChange={state => updateWindowState("listbox", state)}
          showPorts={nodeViewMode}
          inputs={windowPorts.listbox.inputs}
          outputs={windowPorts.listbox.outputs}
        >
          <div className="flex h-full flex-col gap-4">
            <p className="text-[0.72rem] text-muted">
              The listbox supports mouse, keyboard, and disabled options.
            </p>
            <Listbox options={listboxOptions} value={listboxSelection} onChange={setListboxSelection} className="flex-1" />
            <div className="rounded border border-dashed border-[var(--toolbar-border)] px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-muted">
              Selected: {listboxSelection ?? "None"}
            </div>
          </div>
        </Window>
      )}

      {/* Menubar Window */}
      {openWindows.has("menubar") && (
        <Window
          id="menubar"
          title="Menubar"
          icon={<MenubarIcon />}
          initialPosition={{ x: 280, y: 40 }}
          initialSize={{ width: 520, height: 260 }}
          onClose={() => closeWindow("menubar")}
          onFocus={() => focusWindow("menubar")}
          focused={focusedWindow === "menubar"}
          state={windowStates["menubar"]}
          onStateChange={state => updateWindowState("menubar", state)}
          showPorts={nodeViewMode}
          inputs={windowPorts.menubar.inputs}
          outputs={windowPorts.menubar.outputs}
        >
          <div className="space-y-4">
            <Menubar items={menubarItems} />
            <div className="rounded border border-[var(--control-border)] bg-control px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-muted">
              {menubarMessage}
            </div>
            <p className="text-[0.68rem] text-muted">
              Use nested menus, separators, and destructive actions to model product chrome.
            </p>
          </div>
        </Window>
      )}

      {/* Navbar Window */}
      {openWindows.has("navbar") && (
        <Window
          id="navbar"
          title="Navbar"
          icon={<NavbarIcon />}
          initialPosition={{ x: 220, y: 420 }}
          initialSize={{ width: 560, height: 320 }}
          onClose={() => closeWindow("navbar")}
          onFocus={() => focusWindow("navbar")}
          focused={focusedWindow === "navbar"}
          state={windowStates["navbar"]}
          onStateChange={state => updateWindowState("navbar", state)}
          showPorts={nodeViewMode}
          inputs={windowPorts.navbar.inputs}
          outputs={windowPorts.navbar.outputs}
        >
          <div className="space-y-4">
            <Navbar
              brand={<span className="text-[0.72rem] uppercase tracking-[0.24em]">Nebula Studio</span>}
              links={navbarLinks}
              actions={<Button size="sm">Invite</Button>}
            >
              <span className="rounded border border-[var(--control-border)] bg-control px-2 py-1 text-[0.6rem] uppercase tracking-[0.24em] text-muted">
                Beta
              </span>
            </Navbar>
            <p className="text-[0.72rem] text-muted">
              Navbar items support active states, icons, and custom action slots.
            </p>
          </div>
        </Window>
      )}

      {/* Sidebar Window */}
      {openWindows.has("sidebar") && (
        <Window
          id="sidebar"
          title="Sidebar"
          icon={<SidebarIcon />}
          initialPosition={{ x: 760, y: 360 }}
          initialSize={{ width: 520, height: 400 }}
          onClose={() => closeWindow("sidebar")}
          onFocus={() => focusWindow("sidebar")}
          focused={focusedWindow === "sidebar"}
          state={windowStates["sidebar"]}
          onStateChange={state => updateWindowState("sidebar", state)}
          showPorts={nodeViewMode}
          inputs={windowPorts.sidebar.inputs}
          outputs={windowPorts.sidebar.outputs}
        >
          <div className="flex h-full gap-4">
            <Sidebar
              sections={sidebarSections}
              selectedId={sidebarSelection}
              collapsed={sidebarCollapsed}
              onToggleCollapse={setSidebarCollapsed}
              onSelect={setSidebarSelection}
              className="h-full"
            />
            <div className="flex-1 space-y-3">
              <p className="text-[0.72rem] text-muted">
                The sidebar component nests groups, handles collapse, and renders badges.
              </p>
              <div className="rounded border border-dashed border-[var(--toolbar-border)] px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-muted">
                Selected item: {sidebarSelection ?? "None"}
              </div>
            </div>
          </div>
        </Window>
      )}

      {/* Toolbar Window */}
      {openWindows.has("toolbar") && (
        <Window
          id="toolbar"
          title="Toolbar + Ribbon"
          icon={<ToolbarIcon />}
          initialPosition={{ x: 420, y: 520 }}
          initialSize={{ width: 640, height: 420 }}
          onClose={() => closeWindow("toolbar")}
          onFocus={() => focusWindow("toolbar")}
          focused={focusedWindow === "toolbar"}
          state={windowStates["toolbar"]}
          onStateChange={state => updateWindowState("toolbar", state)}
          showPorts={nodeViewMode}
          inputs={windowPorts.toolbar.inputs}
          outputs={windowPorts.toolbar.outputs}
        >
          <div className="space-y-4">
            <Ribbon
              tabs={ribbonTabs}
              activeTabId={activeRibbonTab}
              onTabChange={setActiveRibbonTab}
              density="compact"
            />
            <Toolbar groups={toolbarGroups} density="comfortable" />
            <p className="text-[0.68rem] text-muted">
              Combine the ribbon shell with the toolbar primitive for high-density control surfaces.
            </p>
          </div>
        </Window>
      )}

      {/* Tooltip Window */}
      {openWindows.has("tooltip") && (
        <Window
          id="tooltip"
          title="Tooltips"
          icon={<TooltipIcon />}
          initialPosition={{ x: 640, y: 520 }}
          initialSize={{ width: 420, height: 320 }}
          onClose={() => closeWindow("tooltip")}
          onFocus={() => focusWindow("tooltip")}
          focused={focusedWindow === "tooltip"}
          state={windowStates["tooltip"]}
          onStateChange={state => updateWindowState("tooltip", state)}
          showPorts={nodeViewMode}
          inputs={windowPorts.tooltip.inputs}
          outputs={windowPorts.tooltip.outputs}
        >
          <div className="space-y-4">
            <p className="text-[0.72rem] text-muted">
              Tooltips appear on hover and focus with directional arrows.
            </p>
            <div className="flex flex-wrap gap-3">
              <Tooltip label="Duplicate the current component">
                <Button size="sm" variant="secondary">
                  Duplicate
                </Button>
              </Tooltip>
              <Tooltip label="Archive and remove from the library" placement="bottom">
                <Button size="sm" variant="warning">
                  Archive
                </Button>
              </Tooltip>
              <Tooltip label="Copy a shareable link" placement="right">
                <Button size="sm">Copy link</Button>
              </Tooltip>
            </div>
          </div>
        </Window>
      )}

      {/* Modal Window */}
      {openWindows.has("modal") && (
        <Window
          id="modal"
          title="Modal Dialog"
          icon={<ModalIcon />}
          initialPosition={{ x: 860, y: 160 }}
          initialSize={{ width: 420, height: 280 }}
          onClose={() => closeWindow("modal")}
          onFocus={() => focusWindow("modal")}
          focused={focusedWindow === "modal"}
          state={windowStates["modal"]}
          onStateChange={state => updateWindowState("modal", state)}
          showPorts={nodeViewMode}
          inputs={windowPorts.modal.inputs}
          outputs={windowPorts.modal.outputs}
        >
          <div className="space-y-4">
            <p className="text-[0.72rem] text-muted">
              Test modal focus trapping, escape handling, and overlay dismissal.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setModalOpen(true)}>Open modal</Button>
              <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={!modalOpen}>
                Close modal
              </Button>
            </div>
            <p className="text-[0.68rem] text-muted">
              The modal portal renders at the document root to match product behavior.
            </p>
          </div>
        </Window>
      )}

      {/* Tree View Window */}
      {openWindows.has("tree") && (
        <Window
          id="tree"
          title="Tree View"
          icon={<TreeIcon />}
          initialPosition={{ x: 980, y: 360 }}
          initialSize={{ width: 420, height: 400 }}
          onClose={() => closeWindow("tree")}
          onFocus={() => focusWindow("tree")}
          focused={focusedWindow === "tree"}
          state={windowStates["tree"]}
          onStateChange={state => updateWindowState("tree", state)}
          showPorts={nodeViewMode}
          inputs={windowPorts.tree.inputs}
          outputs={windowPorts.tree.outputs}
        >
          <div className="flex h-full flex-col gap-4">
            <p className="text-[0.72rem] text-muted">
              Navigate nested resources with keyboard support and badges.
            </p>
            <TreeView
              items={treeItems}
              selectedId={treeSelection}
              expandedIds={treeExpanded}
              onSelect={setTreeSelection}
              onExpandedChange={setTreeExpanded}
              className="flex-1"
            />
            <div className="rounded border border-dashed border-[var(--toolbar-border)] px-3 py-2 text-[0.68rem] uppercase tracking-[0.18em] text-muted">
              Selected node: {treeSelection ?? "None"}
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
          showPorts={nodeViewMode}
          inputs={windowPorts.theme.inputs}
          outputs={windowPorts.theme.outputs}
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
          initialSize={{ width: 760, height: 520 }}
          onClose={() => closeWindow("workflow")}
          onFocus={() => focusWindow("workflow")}
          focused={focusedWindow === "workflow"}
          state={windowStates["workflow"]}
          onStateChange={(state) => updateWindowState("workflow", state)}
          showPorts={nodeViewMode}
          inputs={windowPorts.workflow.inputs}
          outputs={windowPorts.workflow.outputs}
        >
          <div className="flex h-full flex-col gap-4">
            <div className="rounded border border-[var(--control-border)] bg-[var(--control-bg)] px-3 py-2 text-[0.72rem] text-muted">
              Use the palette to drop new steps onto the canvas, then drag nodes to lay out your workflow.
            </div>
            <NodeEditor
              nodes={nodeEditorNodes}
              palette={nodePalette}
              onNodesChange={setNodeEditorNodes}
              gridSize={24}
              snapToGrid={false}
              className="flex-1 min-h-[360px]"
              viewportHeight={380}
            />
          </div>
        </Window>
      )}
      </Desktop>
      <CommandPalette
        commands={commandPaletteCommands}
        open={commandPaletteOpen && openWindows.has("palette")}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <Modal
        open={modalOpen && openWindows.has("modal")}
        onClose={() => setModalOpen(false)}
        title="Schedule deployment"
        description="Confirm blueprint publication to the selected environment."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                notify({ title: "Deployment scheduled", description: "Release goes live at 09:00 UTC.", variant: "success" });
                setModalOpen(false);
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-[0.72rem] text-muted">
            Choose a window and environment to publish your updated components. All approvers will be notified.
          </p>
          <div className="grid grid-cols-2 gap-3 text-[0.72rem]">
            <div className="rounded border border-[var(--control-border)] bg-control px-3 py-2">
              <h4 className="text-[0.68rem] uppercase tracking-[0.18em] text-muted">Window</h4>
              <p className="text-subtle">October 9, 2024 09:00 UTC</p>
            </div>
            <div className="rounded border border-[var(--control-border)] bg-control px-3 py-2">
              <h4 className="text-[0.68rem] uppercase tracking-[0.18em] text-muted">Environment</h4>
              <p className="text-subtle">Production</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
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
