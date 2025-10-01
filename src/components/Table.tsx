import type { ReactNode } from "react";
import { cn } from "../utils/cn";

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
    <div className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
      No records found
    </div>
  ),
}: TableProps<T>) {
  if (columns.length === 0) return null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm",
        "dark:border-slate-800 dark:bg-slate-950",
        className
      )}
    >
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-400">
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
        <tbody className="divide-y divide-slate-100 text-sm text-slate-700 dark:divide-slate-900 dark:text-slate-200">
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length}>{emptyState}</td>
            </tr>
          )}
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                striped && rowIndex % 2 === 1
                  ? "bg-slate-50/60 dark:bg-slate-900/40"
                  : "bg-transparent",
                onRowClick && "cursor-pointer hover:bg-[var(--accent-muted)]"
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
                      "px-3 text-sm",
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
