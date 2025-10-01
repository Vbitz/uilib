import "./index.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Accordion,
  Button,
  Card,
  CardSection,
  CommandPalette,
  ContextMenu,
  Breadcrumb,
  Listbox,
  Menubar,
  Navbar,
  Modal,
  NodeEditor,
  Ribbon,
  Sidebar,
  Table,
  Textbox,
  ThemeProvider,
  Toolbar,
  Tooltip,
  TreeView,
  Tabs,
  ToastProvider,
  useToast,
  useTheme,
  Pagination,
  type EditorEdge,
  type EditorNode,
  type Command,
  type MenuEntry,
  type MenubarItem,
  type NodePaletteItem,
  type SidebarSection,
  type RibbonTab,
  type TableColumn,
  type ToolbarGroup,
  type TreeItem,
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

const statuses: Array<{ id: Task["status"]; label: string; description: string }> = [
  { id: "Backlog", label: "Backlog", description: "Ideas captured for later" },
  { id: "In Progress", label: "In Progress", description: "Actively being executed" },
  { id: "Review", label: "Review", description: "Needs stakeholder sign-off" },
  { id: "Done", label: "Done", description: "Shipped and verified" },
];

const accentSwatches = [
  { name: "Indigo", value: "#4f46e5" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Cyan", value: "#06b6d4" },
];

const nodePaletteItems: NodePaletteItem[] = [
  {
    type: "ingest",
    label: "Data Ingest",
    description: "Connect external telemetry streams into the workspace.",
    badge: "Input",
    defaultSize: { width: 220, height: 130 },
    defaults: {
      status: "success",
      metadata: { Streams: 3, Rate: "240/s" },
    },
  },
  {
    type: "transform",
    label: "Transform",
    description: "Apply normalization and schema validation.",
    badge: "Compute",
    defaultSize: { width: 220, height: 140 },
    defaults: {
      status: "default",
      metadata: { Steps: 4, Latency: "12ms" },
    },
  },
  {
    type: "branch",
    label: "Branch",
    description: "Route payloads based on predicates and thresholds.",
    badge: "Routing",
    defaultSize: { width: 220, height: 120 },
    defaults: {
      status: "warning",
      metadata: { Guards: 2, Coverage: "96%" },
    },
  },
  {
    type: "publish",
    label: "Publish",
    description: "Emit artifacts to downstream systems and dashboards.",
    badge: "Output",
    defaultSize: { width: 220, height: 130 },
    defaults: {
      status: "success",
      metadata: { Targets: 5, Retries: "0" },
    },
  },
];

const initialEditorNodes: EditorNode[] = [
  {
    id: "node-ingest",
    label: "Collector",
    description: "Streams metrics from edge agents",
    position: { x: 80, y: 120 },
    width: 220,
    height: 130,
    status: "success",
    metadata: { Streams: "3", Rate: "240/s" },
  },
  {
    id: "node-normalize",
    label: "Normalizer",
    description: "Validates payload shape and types",
    position: { x: 360, y: 100 },
    width: 220,
    height: 140,
    status: "default",
    metadata: { Steps: "4", Latency: "12ms" },
  },
  {
    id: "node-branch",
    label: "Branch",
    description: "Routes by service tier",
    position: { x: 360, y: 270 },
    width: 220,
    height: 120,
    status: "warning",
    metadata: { Guards: "2", Coverage: "96%" },
  },
  {
    id: "node-publish",
    label: "Publisher",
    description: "Delivers dashboards & alerts",
    position: { x: 640, y: 180 },
    width: 220,
    height: 130,
    status: "success",
    metadata: { Targets: "5", Retries: "0" },
  },
];

const initialEditorEdges: EditorEdge[] = [
  { id: "edge-ingest-normalize", source: "node-ingest", target: "node-normalize", label: "Normalize" },
  { id: "edge-normalize-branch", source: "node-normalize", target: "node-branch", label: "Route" },
  { id: "edge-branch-publish", source: "node-branch", target: "node-publish", label: "Publish" },
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
          className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
        >
          {status}
        </span>
      );
    },
  },
  { key: "assignee", header: "Owner" },
  { key: "due", header: "Due", align: "right" },
];

const FolderIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 text-slate-400">
    <path d="M4 6.75A1.75 1.75 0 015.75 5h4.19l1.6 1.6c.33.33.78.52 1.25.52h5.41A1.75 1.75 0 0120.5 8.87V17.5a1.75 1.75 0 01-1.75 1.75h-13A1.75 1.75 0 014 17.5z" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 text-slate-400">
    <path d="M7.5 4.75A1.75 1.75 0 019.25 3h5.5L19 7.25v12a1.75 1.75 0 01-1.75 1.75h-9.5A1.75 1.75 0 016 19.25v-12z" />
    <path d="M14.25 3v3.5c0 .69.56 1.25 1.25 1.25H19" fill="currentColor" />
  </svg>
);

function Workspace() {
  const { mode, toggleMode, setAccent, accent } = useTheme();
  const { notify, dismissAll } = useToast();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Task["status"] | null>("In Progress");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [explorerSelection, setExplorerSelection] = useState<string>("src-app");
  const [toolbarDensity, setToolbarDensity] = useState<"compact" | "comfortable">("comfortable");
  const [viewMode, setViewMode] = useState<"table" | "board">("table");
  const [modalOpen, setModalOpen] = useState(false);
  const [paginationPage, setPaginationPage] = useState(2);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarSelection, setSidebarSelection] = useState<string>("collection-overview");
  const [activeTab, setActiveTab] = useState<string>("tab-overview");
  const [accordionOpen, setAccordionOpen] = useState<string[]>(["section-dx"]);
  const [editorNodes, setEditorNodes] = useState<EditorNode[]>(() =>
    initialEditorNodes.map(node => ({
      ...node,
      position: { ...node.position },
      metadata: node.metadata ? { ...node.metadata } : undefined,
    }))
  );
  const [editorEdges, setEditorEdges] = useState<EditorEdge[]>(() =>
    initialEditorEdges.map(edge => ({ ...edge }))
  );
  const [selectedNode, setSelectedNode] = useState<string | null>(initialEditorNodes[0]?.id ?? null);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const filteredTasks = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tasks.filter(task => {
      if (selectedStatus && task.status !== selectedStatus) return false;
      if (!term) return true;
      return Object.values(task).some(value => String(value).toLowerCase().includes(term));
    });
  }, [search, selectedStatus]);

  const commands = useMemo<Command[]>(
    () => [
      {
        id: "toggle-theme",
        label: mode === "light" ? "Switch to dark mode" : "Switch to light mode",
        section: "Theme",
        keywords: ["theme", "mode", "appearance"],
        onSelect: toggleMode,
        shortcut: "⌘⇧L",
      },
      ...accentSwatches.map(swatch => ({
        id: `accent-${swatch.value}`,
        label: `Set accent to ${swatch.name}`,
        section: "Accent",
        keywords: ["accent", swatch.name],
        onSelect: () => setAccent(swatch.value),
      })),
    ],
    [mode, setAccent, toggleMode]
  );

  const totalPages = 12;

  const handleSelectNode = useCallback(
    (nodeId: string | null) => {
      setSelectedNode(nodeId);
      if (nodeId) {
        setSidebarSelection(nodeId);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedNode && !editorNodes.some(node => node.id === selectedNode)) {
      const fallback = editorNodes[0]?.id ?? null;
      if (fallback) {
        handleSelectNode(fallback);
      } else {
        setSelectedNode(null);
        setSidebarSelection("collection-overview");
      }
    }
  }, [editorNodes, handleSelectNode, selectedNode, setSidebarSelection]);

  const repositoryTree = useMemo<TreeItem[]>(
    () => [
      {
        id: "src",
        label: "src",
        icon: <FolderIcon />,
        children: [
          { id: "src-app", label: "App.tsx", icon: <FileIcon />, description: "Main workspace view" },
          { id: "src-components", label: "components", icon: <FolderIcon />, children: [
            { id: "src-components-toolbar", label: "Toolbar.tsx", icon: <FileIcon /> },
            { id: "src-components-menubar", label: "Menubar.tsx", icon: <FileIcon /> },
            { id: "src-components-tree", label: "TreeView.tsx", icon: <FileIcon /> },
          ] },
          { id: "src-utils", label: "utils", icon: <FolderIcon />, children: [
            { id: "src-utils-cn", label: "cn.ts", icon: <FileIcon />, badge: "Helper" },
          ] },
        ],
      },
      {
        id: "config",
        label: "config",
        icon: <FolderIcon />,
        children: [
          { id: "config-bun", label: "bunfig.toml", icon: <FileIcon /> },
          { id: "config-ts", label: "tsconfig.json", icon: <FileIcon /> },
        ],
      },
      {
        id: "docs",
        label: "docs",
        icon: <FolderIcon />,
        children: [
          { id: "docs-readme", label: "README.md", icon: <FileIcon />, badge: "Updated" },
          { id: "docs-todo", label: "TODO.md", icon: <FileIcon /> },
        ],
      },
    ],
    []
  );

  const menubarItems = useMemo<MenubarItem[]>(
    () => [
      {
        id: "file",
        label: "File",
        items: [
          {
            id: "file-new",
            label: "New Workspace…",
            shortcut: "⌘N",
            onSelect: () => setPaletteOpen(true),
          },
          {
            id: "file-open",
            label: "Open Recent",
            kind: "submenu",
            items: [
              { id: "recent-1", label: "nebula-ui", onSelect: () => setExplorerSelection("src-app") },
              { id: "recent-2", label: "nebula-docs", onSelect: () => setExplorerSelection("docs-readme") },
              { id: "recent-sep", kind: "separator" },
              {
                id: "recent-clear",
                label: "Clear Recent",
                destructive: true,
                onSelect: () => setExplorerSelection("src-app"),
              },
            ],
          },
          { id: "file-sep", kind: "separator" },
          {
            id: "file-preferences",
            label: "Preferences",
            shortcut: "⌘,",
            onSelect: () => setPaletteOpen(true),
          },
        ],
      },
      {
        id: "view",
        label: "View",
        items: [
          {
            id: "view-toggle-mode",
            label: mode === "light" ? "Enable Dark Mode" : "Enable Light Mode",
            shortcut: "⌃L",
            onSelect: toggleMode,
          },
          {
            id: "view-command",
            label: "Command Palette",
            shortcut: "⌘K",
            onSelect: () => setPaletteOpen(true),
          },
        ],
      },
      {
        id: "help",
        label: "Help",
        items: [
          {
            id: "help-support",
            label: "Support Portal",
            onSelect: () => setPaletteOpen(true),
          },
          { id: "help-sep", kind: "separator" },
          {
            id: "help-about",
            label: "About Nebula UI",
            onSelect: () => setPaletteOpen(true),
          },
        ],
      },
   ],
    [mode, setPaletteOpen, toggleMode]
  );

  const tableContextMenu = useMemo<MenuEntry[]>(
    () => [
      { id: "ctx-refresh", label: "Refresh Data", onSelect: () => setSearch("") },
      { id: "ctx-sep", kind: "separator" },
      { id: "ctx-export", label: "Export CSV", onSelect: () => setPaletteOpen(true) },
      { id: "ctx-delete", label: "Delete Selected", destructive: true, onSelect: () => setPaletteOpen(true) },
    ],
    [setPaletteOpen, setSearch]
  );

  const toolbarGroups = useMemo<ToolbarGroup[]>(
    () => [
      {
        id: "view-mode",
        label: "View",
        actions: [
          {
            id: "view-table",
            label: "Table",
            active: viewMode === "table",
            onSelect: () => setViewMode("table"),
            description: "Tabular representation",
          },
          {
            id: "view-board",
            label: "Board",
            active: viewMode === "board",
            onSelect: () => setViewMode("board"),
            description: "Swimlane-style planning",
          },
        ],
      },
      {
        id: "density",
        label: "Density",
        actions: [
          {
            id: "density-compact",
            label: "Compact",
            active: toolbarDensity === "compact",
            onSelect: () => setToolbarDensity("compact"),
            description: "Tight spacing",
          },
          {
            id: "density-comfortable",
            label: "Comfortable",
            active: toolbarDensity === "comfortable",
            onSelect: () => setToolbarDensity("comfortable"),
            description: "Roomier layout",
          },
        ],
      },
    ],
    [setToolbarDensity, setViewMode, toolbarDensity, viewMode]
  );

  const ribbonTabs = useMemo<RibbonTab[]>(
    () => {
      const baseGroups = toolbarGroups.filter((group): group is ToolbarGroup => Boolean(group));
      return [
        {
          id: "plan",
          label: "Plan",
          description: "Organize tasks and release criteria",
          groups: [
            ...baseGroups,
            {
              id: "plan-actions",
              label: "Actions",
              actions: [
                {
                  id: "plan-command",
                  label: "Run Command Palette",
                  onSelect: () => setPaletteOpen(true),
                  description: "Quick command access",
                },
                {
                  id: "plan-theme",
                  label: mode === "light" ? "Dark Theme" : "Light Theme",
                  onSelect: toggleMode,
                  description: "Toggle appearance",
                },
              ],
            },
          ],
        },
        {
          id: "automate",
          label: "Automate",
          description: "Accelerate delivery with presets",
          groups: [
            {
              id: "automation",
              label: "Automation",
              actions: [
                {
                  id: "automation-review",
                  label: "Request Reviews",
                  onSelect: () => setPaletteOpen(true),
                },
                {
                  id: "automation-export",
                  label: "Schedule Export",
                  onSelect: () => setPaletteOpen(true),
                },
              ],
            },
          ],
        },
      ];
    },
    [mode, setPaletteOpen, toggleMode, toolbarGroups]
  );

  const sidebarSections = useMemo<SidebarSection[]>(
    () => [
      {
        id: "collections",
        label: "Collections",
        items: [
          {
            id: "collection-overview",
            label: "Overview",
            description: "Dashboards & metrics",
            onSelect: () => setSidebarSelection("collection-overview"),
          },
          {
            id: "collection-flows",
            label: "Flows",
            description: "Pipeline definitions",
            onSelect: () => setSidebarSelection("collection-flows"),
          },
          {
            id: "collection-policies",
            label: "Policies",
            description: "Governance & approvals",
            items: [
              {
                id: "policy-change",
                label: "Change Control",
                description: "Two-person signoff",
                onSelect: () => setSidebarSelection("policy-change"),
              },
              {
                id: "policy-audit",
                label: "Audit Log",
                description: "Immutable history",
                onSelect: () => setSidebarSelection("policy-audit"),
              },
            ],
          },
        ],
      },
      {
        id: "pipeline",
        label: "Pipeline Nodes",
        items: editorNodes.map(node => ({
          id: node.id,
          label: node.label,
          description: node.description,
          badge: node.status?.toUpperCase(),
          onSelect: () => handleSelectNode(node.id),
        })),
      },
    ],
    [editorNodes, handleSelectNode, setSidebarSelection]
  );

  const breadcrumbItems = useMemo(
    () => [
      {
        id: "crumb-projects",
        label: "Projects",
        onSelect: () => setExplorerSelection("docs-readme"),
      },
      {
        id: "crumb-nebula",
        label: "Nebula UI",
        onSelect: () => setExplorerSelection("src-app"),
      },
      {
        id: "crumb-status",
        label: selectedStatus ?? "All statuses",
        icon: <span className="inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />,
      },
    ],
    [selectedStatus, setExplorerSelection]
  );

  const accordionItems = useMemo(
    () => [
      {
        id: "section-dx",
        title: "Developer Experience",
        description: "Affordances designed for IDE-like ergonomics.",
        content: (
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              Inline focus rings mirror command palette shortcuts and reduce context switching.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              Low-latency components share a unified density scale for grid, form, and table surfaces.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              Keyboard narration pairs with tooltips so advanced operators learn flows without leaving the keyboard.
            </li>
          </ul>
        ),
      },
      {
        id: "section-publishing",
        title: "Publishing",
        description: "Ship releases with guardrails and observability.",
        content: (
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>Bundle releases with environment-specific configuration and release windows.</p>
            <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
              Tip: Use the modal action to review tonight's deployment entries from the command ribbon.
            </p>
          </div>
        ),
      },
      {
        id: "section-metrics",
        title: "Metrics",
        description: "Device health and feature adoption reporting.",
        content: (
          <dl className="grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">Feature adoption</dt>
              <dd className="text-base font-semibold text-slate-700 dark:text-slate-100">82%</dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/60">
              <dt className="text-xs uppercase tracking-[0.18em] text-slate-400">Latency (p95)</dt>
              <dd className="text-base font-semibold text-slate-700 dark:text-slate-100">118ms</dd>
            </div>
          </dl>
        ),
      },
    ],
    []
  );

  const selectedNodeDetails = useMemo(
    () => editorNodes.find(node => node.id === selectedNode) ?? null,
    [editorNodes, selectedNode]
  );

  const tabItems = useMemo(
    () => [
      {
        id: "tab-overview",
        label: "Overview",
        description: "Pipeline snapshot",
        content: (
          <div className="space-y-3">
            <p>
              {selectedNodeDetails
                ? `Inspecting ${selectedNodeDetails.label} with ${Object.keys(selectedNodeDetails.metadata ?? {}).length} tracked signals.`
                : "Select any node from the sidebar to inspect live metadata."}
            </p>
            {selectedNodeDetails && selectedNodeDetails.metadata && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedNodeDetails.metadata).map(([key, value]) => (
                  <div key={key} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">{key}</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-100">{String(value)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      },
      {
        id: "tab-workload",
        label: "Workload",
        description: "Delivery cadence",
        content: (
          <div className="space-y-3">
            <p>
              Tracking <strong>{filteredTasks.length}</strong> tasks filtered by <strong>{selectedStatus ?? "All"}</strong> status.
            </p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {filteredTasks.map(task => (
                <li key={task.name} className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60">
                  <span className="font-medium text-slate-600 dark:text-slate-200">{task.name}</span>
                  <span className="text-slate-400">{task.status}</span>
                </li>
              ))}
              {filteredTasks.length === 0 && <li className="text-xs text-slate-400">No tasks match the current filter.</li>}
            </ul>
          </div>
        ),
      },
      {
        id: "tab-activity",
        label: "Activity",
        description: "Recent signals",
        content: (
          <div className="space-y-3">
            <p>You're on page {paginationPage} of {totalPages} in the release navigator.</p>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="rounded border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60">Command palette triggered 8 times today.</li>
              <li className="rounded border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60">Three pipelines executed successfully in the last hour.</li>
              <li className="rounded border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-900/60">Two upcoming deployments require manual approval.</li>
            </ul>
          </div>
        ),
      },
    ],
    [filteredTasks, paginationPage, selectedNodeDetails, selectedStatus, totalPages]
  );

  const handleNotify = useCallback(() => {
    notify({
      title: "Deployment queued",
      description: "Release candidate 24.10 is staged for tonight at 22:00 UTC.",
      variant: "info",
    });
  }, [notify]);

  const handleWarn = useCallback(() => {
    notify({
      title: "Policy check failed",
      description: "Two services require updated health checks before rollout.",
      variant: "warning",
    });
  }, [notify]);

  const navbarLinks = useMemo(
    () => [
      { id: "overview", label: "Overview", active: true },
      { id: "activity", label: "Activity" },
      { id: "settings", label: "Settings" },
    ],
    []
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        brand={
          <span className="text-base font-semibold">
            Nebula<span className="text-slate-400">UI</span>
          </span>
        }
        links={navbarLinks}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={toggleMode}>
              {mode === "light" ? "Dark mode" : "Light mode"}
            </Button>
            <Button onClick={() => setPaletteOpen(true)}>Command Palette</Button>
          </div>
        }
      />
      <Menubar items={menubarItems} />
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8">
        <Card title="Workspace Controls" description="Fine-tune the dashboard for your power users.">
          <CardSection title="Search" description="Filter tasks, owners, or metadata." defaultOpen>
            <Textbox
              label="Quick find"
              placeholder="Find tasks, people, or commands"
              value={search}
              onChange={event => setSearch(event.target.value)}
              startSlot={<span className="text-slate-400">⌕</span>}
            />
          </CardSection>
          <CardSection title="Accent" description="Switch the highlight color for the current session." defaultOpen>
            <div className="mt-2 flex flex-wrap gap-2">
              {accentSwatches.map(swatch => (
                <button
                  key={swatch.value}
                  type="button"
                  onClick={() => setAccent(swatch.value)}
                  className="group relative h-9 w-9 rounded-md border border-slate-200 transition hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800"
                  style={{ backgroundColor: swatch.value }}
                  aria-label={`Use ${swatch.name} accent`}
                >
                  {accent.toLowerCase() === swatch.value.toLowerCase() && (
                    <span className="absolute inset-1 rounded-sm border-2 border-white shadow ring-2 ring-slate-900/70 dark:border-slate-950 dark:ring-slate-50/80" />
                  )}
                </button>
              ))}
            </div>
          </CardSection>
        </Card>

        <section className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <Card title="Filters & Explorer" description="Focus the dataset and browse project assets.">
            <CardSection title="Status Filter" description="Narrow the dataset by workflow state.">
              <Listbox
                options={statuses.map(status => ({
                  id: status.id,
                  label: status.label,
                  description: status.description,
                }))}
                value={selectedStatus}
                onChange={value => setSelectedStatus(value as Task["status"])}
              />
            </CardSection>
            <CardSection
              title="Project Explorer"
              description="Navigate files in the UI kit."
              defaultOpen
            >
              <TreeView
                items={repositoryTree}
                selectedId={explorerSelection}
                onSelect={setExplorerSelection}
                defaultExpandedIds={["src", "config", "docs", "src-components"]}
              />
            </CardSection>
          </Card>

          <ContextMenu items={tableContextMenu}>
            <Card
              title="Release Tracker"
              description="Track delivery readiness across your engineering org."
              actions={<Button size="sm">Export</Button>}
            >
              <div className="flex flex-col gap-3">
                <Toolbar groups={toolbarGroups} density={toolbarDensity} />
                <Table<Task> columns={tableColumns} data={filteredTasks} striped density="comfortable" />
              </div>
            </Card>
          </ContextMenu>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card title="Buttons" description="Variants for primary workflows and alerts.">
            <div className="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="error">Error</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Card>
          <Card title="Form Inputs" description="Designed to match editor chrome.">
            <div className="flex flex-col gap-3">
              <Textbox label="Repository" placeholder="astra/nebula" />
              <Textbox label="Owner" placeholder="Casey Simmons" disabled />
              <Textbox
                label="API Key"
                placeholder="••••••••••••"
                endSlot={<Button size="sm">Reveal</Button>}
              />
            </div>
          </Card>
        </section>

        <Card title="Command Ribbons" description="Contextual actions organized in tabs.">
          <Ribbon tabs={ribbonTabs} density={toolbarDensity} />
        </Card>

        <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
          <Sidebar
            sections={sidebarSections}
            selectedId={sidebarSelection}
            onSelect={id => {
              setSidebarSelection(id);
              if (id.startsWith("node-")) {
                handleSelectNode(id);
              } else {
                setSelectedNode(null);
              }
            }}
            header={<div className="text-sm font-semibold text-slate-100">Blueprints</div>}
            footer={
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <span>Shortcut: Shift + N</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleSelectNode(editorNodes[0]?.id ?? null)}
                >
                  Focus first node
                </Button>
              </div>
            }
            collapsed={sidebarCollapsed}
            onToggleCollapse={setSidebarCollapsed}
          />
          <div className="flex flex-col gap-4">
            <Card title="Navigation & Feedback" description="Coordinate releases and notify stakeholders.">
              <div className="flex flex-col gap-4">
                <Breadcrumb items={breadcrumbItems} />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Pagination
                    page={paginationPage}
                    pageCount={totalPages}
                    onPageChange={setPaginationPage}
                    siblings={1}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Tooltip label="Preview tonight's deployment runbook">
                      <Button variant="secondary" onClick={() => setModalOpen(true)}>
                        Review Runbook
                      </Button>
                    </Tooltip>
                    <Button onClick={handleNotify}>Info Toast</Button>
                    <Button variant="warning" onClick={handleWarn}>
                      Warn Toast
                    </Button>
                    <button
                      type="button"
                      onClick={dismissAll}
                      className="text-xs font-medium text-slate-500 underline transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Clear toasts
                    </button>
                  </div>
                </div>
              </div>
            </Card>
            <Card title="Knowledge Base" description="Reference expandable guidance for operators.">
              <Accordion
                items={accordionItems}
                value={accordionOpen}
                onValueChange={setAccordionOpen}
                type="multiple"
              />
            </Card>
            <Card title="Insights" description="Switch between snapshots of the workspace.">
              <Tabs items={tabItems} value={activeTab} onValueChange={setActiveTab} />
            </Card>
          </div>
        </section>

        <Card title="Orchestration Canvas" description="Model node relationships and publish automation flows.">
          <NodeEditor
            nodes={editorNodes}
            edges={editorEdges}
            palette={nodePaletteItems}
            selectedNodeId={selectedNode}
            onSelectNode={handleSelectNode}
            onNodesChange={setEditorNodes}
            onEdgesChange={setEditorEdges}
            gridSize={16}
            snapToGrid
          />
        </Card>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Tonight's Deployment"
        description="Review the checklist before scheduling the release window."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleNotify();
              setModalOpen(false);
            }}>
              Approve rollout
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p>
            The candidate build <strong>24.10</strong> has passed automated checks. Confirm alerting and rollback procedures
            before the release window begins at 22:00 UTC.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li>- Observability dashboards replicated to staging.</li>
            <li>- Pager rotation acknowledged by primary and secondary engineers.</li>
            <li>- Rollback script validated in dry-run mode.</li>
          </ul>
        </div>
      </Modal>

      <CommandPalette commands={commands} open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
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
