import type { ReactNode } from "react";
import { cn } from "./utils/cn";

type TableColumn<T> = {
  key: keyof T;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (value: T[keyof T], row: T, rowIndex: number) => ReactNode;
};

type TableProps<T> = {
  columns: Array<TableColumn<T>>;
  data: T[];
  density?: "comfortable" | "compact";
  striped?: boolean;
  className?: string;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
};

const densityMap = {
  comfortable: "py-3",
  compact: "py-2",
} as const;

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  density = "compact",
  striped = true,
  className,
  onRowClick,
  emptyState = (
    <div className="px-3 py-4 text-[0.72rem] uppercase tracking-[0.18em] text-muted">
      No records found
    </div>
  ),
}: TableProps<T>) {
  if (columns.length === 0) return null;

  return (
    <div
      className={cn(
        "border border-[var(--control-border)] bg-[var(--window-bg)] shadow-[0_6px_18px_rgba(9,18,27,0.24)]",
        className
      )}
    >
      <table className="min-w-full divide-y divide-[var(--toolbar-border)] divide-opacity-40">
        <thead className="bg-control text-[0.68rem] uppercase tracking-[0.24em] text-muted">
          <tr>
            {columns.map(column => (
              <th
                key={String(column.key)}
                scope="col"
                className={cn(
                  "px-3 text-left",
                  column.align === "center" && "text-center",
                  column.align === "right" && "text-right"
                )}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--toolbar-border)] text-[0.78rem] text-subtle">
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length}>{emptyState}</td>
            </tr>
          )}
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                striped && rowIndex % 2 === 1 ? "bg-control" : "bg-transparent",
                onRowClick && "cursor-pointer hover:bg-control-hover"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map(column => {
                const value = row[column.key];
                const content = column.render
                  ? column.render(value, row, rowIndex)
                  : (value as ReactNode);

                return (
                  <td
                    key={String(column.key)}
                    className={cn(
                      "px-3",
                      densityMap[density],
                      column.align === "center" && "text-center",
                      column.align === "right" && "text-right"
                    )}
                  >
                    {content}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type { TableColumn, TableProps };
