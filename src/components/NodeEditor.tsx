import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../utils/cn";

type NodeStatus = "default" | "success" | "warning" | "danger";

type EditorNode = {
  id: string;
  label: ReactNode;
  position: { x: number; y: number };
  description?: ReactNode;
  status?: NodeStatus;
  width?: number;
  height?: number;
  metadata?: Record<string, unknown>;
};

type EditorEdge = {
  id: string;
  source: string;
  target: string;
  label?: ReactNode;
};

type NodePaletteItem = {
  type: string;
  label: ReactNode;
  description?: ReactNode;
  accent?: string;
  badge?: ReactNode;
  defaultSize?: { width: number; height: number };
  defaults?: Partial<Omit<EditorNode, "id" | "position" | "label" | "width" | "height" >>;
};

type NodeEditorProps = {
  nodes?: EditorNode[];
  edges?: EditorEdge[];
  palette?: NodePaletteItem[];
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string | null) => void;
  onNodesChange?: (nodes: EditorNode[]) => void;
  onEdgesChange?: (edges: EditorEdge[]) => void;
  onAddNode?: (item: NodePaletteItem) => void;
  className?: string;
  readonly?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
};

type DragState = {
  id: string;
  offsetX: number;
  offsetY: number;
  pointerId: number;
};

const statusClasses: Record<NodeStatus, string> = {
  default: "border-slate-700 bg-slate-900 text-slate-200",
  success: "border-emerald-500/60 bg-emerald-500/10 text-emerald-100",
  warning: "border-amber-500/60 bg-amber-500/10 text-amber-100",
  danger: "border-rose-500/60 bg-rose-500/10 text-rose-100",
};

export function NodeEditor({
  nodes = [],
  edges = [],
  palette = [],
  selectedNodeId,
  onSelectNode,
  onNodesChange,
  onEdgesChange,
  onAddNode,
  className,
  readonly = false,
  gridSize = 16,
  snapToGrid = true,
}: NodeEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [internalNodes, setInternalNodes] = useState<EditorNode[]>(nodes);
  const [internalEdges, setInternalEdges] = useState<EditorEdge[]>(edges);
  const [internalSelection, setInternalSelection] = useState<string | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  useEffect(() => {
    if (onNodesChange) return;
    setInternalNodes(nodes);
  }, [nodes, onNodesChange]);

  useEffect(() => {
    if (onEdgesChange) return;
    setInternalEdges(edges);
  }, [edges, onEdgesChange]);

  const currentNodes = onNodesChange ? nodes : internalNodes;
  const currentEdges = onEdgesChange ? edges : internalEdges;
  const currentSelection = selectedNodeId ?? internalSelection;

  const nodeMap = useMemo(() => {
    const map = new Map<string, EditorNode>();
    for (const node of currentNodes) {
      map.set(node.id, node);
    }
    return map;
  }, [currentNodes]);

  const updateNodes = useCallback(
    (updater: (nodes: EditorNode[]) => EditorNode[]) => {
      if (onNodesChange) {
        onNodesChange(updater(currentNodes));
        return;
      }
      setInternalNodes(prev => updater(prev));
    },
    [currentNodes, onNodesChange]
  );

  const updateSelection = useCallback(
    (id: string | null) => {
      if (selectedNodeId == null) {
        setInternalSelection(id);
      }
      onSelectNode?.(id);
    },
    [onSelectNode, selectedNodeId]
  );

  const scheduleNewNode = useCallback(
    (item: NodePaletteItem) => {
      if (onAddNode) {
        onAddNode(item);
        return;
      }

      updateNodes(current => {
        const fallbackId = `node-${(Math.random() * 1_000_000).toFixed(0)}`;
        const nextId = fallbackId;
        const offset = current.length * 24;
        const width = item.defaultSize?.width ?? 200;
        const height = item.defaultSize?.height ?? 120;
        const newNode: EditorNode = {
          id: nextId,
          label: item.label,
          description: item.description,
          position: { x: 80 + offset, y: 80 + offset },
          width,
          height,
          status: "default",
          ...item.defaults,
        };
        updateSelection(newNode.id);
        return [...current, newNode];
      });
    },
    [onAddNode, updateNodes, updateSelection]
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, node: EditorNode) => {
      if (readonly) return;
      event.preventDefault();
      const target = event.currentTarget;
      const targetRect = target.getBoundingClientRect();
      const offsetX = event.clientX - targetRect.left;
      const offsetY = event.clientY - targetRect.top;
      target.setPointerCapture(event.pointerId);
      setDragState({ id: node.id, offsetX, offsetY, pointerId: event.pointerId });
      updateSelection(node.id);
    },
    [readonly, updateSelection]
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragState || readonly) return;
      const container = editorRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const rawX = event.clientX - rect.left - dragState.offsetX;
      const rawY = event.clientY - rect.top - dragState.offsetY;

      const nextX = snapToGrid ? Math.round(rawX / gridSize) * gridSize : rawX;
      const nextY = snapToGrid ? Math.round(rawY / gridSize) * gridSize : rawY;

      updateNodes(nodesState =>
        nodesState.map(node =>
          node.id === dragState.id
            ? {
                ...node,
                position: {
                  x: Math.max(0, nextX),
                  y: Math.max(0, nextY),
                },
              }
            : node
        )
      );
    },
    [dragState, gridSize, readonly, snapToGrid, updateNodes]
  );

  const handlePointerUp = useCallback(() => {
    setDragState(null);
  }, []);

  const edgesToRender = useMemo(() => {
    return currentEdges
      .map(edge => {
        const source = nodeMap.get(edge.source);
        const target = nodeMap.get(edge.target);
        if (!source || !target) return null;
        const sourceWidth = source.width ?? 200;
        const sourceHeight = source.height ?? 120;
        const targetWidth = target.width ?? 200;
        const targetHeight = target.height ?? 120;
        const start = {
          x: source.position.x + sourceWidth,
          y: source.position.y + sourceHeight / 2,
        };
        const end = {
          x: target.position.x,
          y: target.position.y + targetHeight / 2,
        };
        return {
          edge,
          start,
          end,
        };
      })
      .filter((value): value is { edge: EditorEdge; start: { x: number; y: number }; end: { x: number; y: number } } => value !== null);
  }, [currentEdges, nodeMap]);

  return (
    <div className={cn("flex w-full gap-4", className)}>
      {palette.length > 0 && (
        <Palette
          items={palette}
          onAdd={scheduleNewNode}
        />
      )}
      <div
        ref={editorRef}
        className="relative h-[540px] flex-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-950"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <GridBackground gridSize={gridSize} />
        <svg className="absolute inset-0 h-full w-full" pointerEvents="none">
          {edgesToRender.map(({ edge, start, end }) => {
            const midX = (start.x + end.x) / 2;
            const path = `M${start.x},${start.y} C${midX},${start.y} ${midX},${end.y} ${end.x},${end.y}`;
            return (
              <g key={edge.id}>
                <path d={path} className="stroke-[var(--accent)]" strokeWidth={1.5} fill="none" markerEnd="url(#node-editor-arrow)" />
                {edge.label && (
                  <foreignObject
                    x={(start.x + end.x) / 2 - 60}
                    y={(start.y + end.y) / 2 - 12}
                    width={120}
                    height={24}
                  >
                    <div className="rounded bg-[var(--accent-muted)] px-2 py-1 text-center text-[10px] font-medium text-[var(--accent-muted-foreground)]">
                      {edge.label}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
          <defs>
            <marker id="node-editor-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L6,3 L0,6 z" fill="var(--accent)" />
            </marker>
          </defs>
        </svg>
        {currentNodes.map(node => {
          const width = node.width ?? 200;
          const height = node.height ?? 120;
          const status = node.status ?? "default";
          const nodeClasses = statusClasses[status] ?? statusClasses.default;
          const isSelected = currentSelection === node.id;

          return (
            <div
              key={node.id}
              style={{
                left: node.position.x,
                top: node.position.y,
                width,
                height,
              }}
              className={cn(
                "group absolute flex cursor-pointer flex-col gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg transition",
                nodeClasses,
                isSelected && "ring-2 ring-[var(--accent)]"
              )}
              role="button"
              tabIndex={0}
              onClick={event => {
                event.stopPropagation();
                updateSelection(node.id);
              }}
              onPointerDown={event => handlePointerDown(event, node)}
            >
              <header className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-300/70">
                <span>NODE</span>
                <span className="rounded bg-black/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">
                  {node.status?.toUpperCase() ?? "DEFAULT"}
                </span>
              </header>
              <div className="flex flex-1 flex-col gap-1">
                <div className="text-base font-medium text-white">{node.label}</div>
                {node.description && <div className="text-xs text-slate-300/80">{node.description}</div>}
                {node.metadata && (
                  <div className="mt-auto grid grid-cols-2 gap-1 text-[11px] text-slate-300/70">
                    {Object.entries(node.metadata).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="flex flex-col rounded border border-white/5 bg-white/5 px-2 py-1">
                        <span className="text-[10px] uppercase tracking-[0.12em] text-slate-400">{key}</span>
                        <span className="truncate text-xs text-white/90">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <footer className="flex items-center justify-between text-[10px] font-medium text-slate-400">
                <span>Outputs</span>
                <span className="inline-flex items-center gap-1 text-slate-300/70">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                  <span>•</span>
                  <span className="h-2 w-2 rounded-full bg-[var(--accent)]" aria-hidden="true" />
                </span>
              </footer>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Palette({
  items,
  onAdd,
}: {
  items: NodePaletteItem[];
  onAdd: (item: NodePaletteItem) => void;
}) {
  return (
    <div className="flex w-64 flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Palette</h3>
        <span className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Nodes</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {items.map(item => (
          <button
            key={item.type}
            type="button"
            onClick={() => onAdd(item)}
            className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-3 text-left text-xs font-medium text-slate-200 transition hover:border-[var(--accent)] hover:text-[var(--accent-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-100">{item.label}</span>
              {item.badge && (
                <span className="rounded bg-[var(--accent-muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-muted-foreground)]">
                  {item.badge}
                </span>
              )}
            </div>
            {item.description && (
              <div className="mt-1 text-[11px] text-slate-400">{item.description}</div>
            )}
          </button>
        ))}
        {items.length === 0 && (
          <div className="rounded border border-dashed border-slate-700 px-3 py-4 text-center text-[11px] text-slate-500">
            Add palette items to spawn new nodes.
          </div>
        )}
      </div>
    </div>
  );
}

function GridBackground({ gridSize }: { gridSize: number }) {
  const patternSize = gridSize * 2;
  const background = `linear-gradient(90deg, rgba(15,23,42,0.2) 1px, transparent 1px), linear-gradient(180deg, rgba(15,23,42,0.2) 1px, transparent 1px)`;

  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: background,
        backgroundSize: `${patternSize}px ${patternSize}px`,
        opacity: 0.4,
      }}
      aria-hidden="true"
    />
  );
}

export type { EditorEdge, EditorNode, NodeEditorProps, NodePaletteItem, NodeStatus };
