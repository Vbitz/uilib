import { type ReactNode } from "react";
import { cn } from "../utils/cn";

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  siblings?: number;
  className?: string;
  previousLabel?: ReactNode;
  nextLabel?: ReactNode;
  disabled?: boolean;
};

type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

function createPagination({
  page,
  pageCount,
  siblings = 1,
}: Pick<PaginationProps, "page" | "pageCount" | "siblings">): PaginationItem[] {
  const clampedPageCount = Math.max(0, Math.trunc(pageCount));
  if (clampedPageCount === 0) return [];

  const safePage = Math.min(Math.max(1, Math.trunc(page)), clampedPageCount);
  const siblingsCount = Math.max(0, Math.trunc(siblings));
  const pages: PaginationItem[] = [];

  pages.push(1);

  if (clampedPageCount === 1) {
    return pages;
  }

  const start = Math.max(2, safePage - siblingsCount);
  const end = Math.min(clampedPageCount - 1, safePage + siblingsCount);

  if (start > 2) {
    pages.push("ellipsis-left");
  } else {
    for (let pageNumber = 2; pageNumber < start; pageNumber++) {
      pages.push(pageNumber);
    }
  }

  for (let pageNumber = start; pageNumber <= end; pageNumber++) {
    if (pageNumber >= 2 && pageNumber <= clampedPageCount - 1) {
      pages.push(pageNumber);
    }
  }

  if (end < clampedPageCount - 1) {
    pages.push("ellipsis-right");
  } else {
    for (let pageNumber = end + 1; pageNumber < clampedPageCount; pageNumber++) {
      pages.push(pageNumber);
    }
  }

  pages.push(clampedPageCount);

  return pages;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblings = 1,
  className,
  previousLabel = "Previous",
  nextLabel = "Next",
  disabled,
}: PaginationProps) {
  const items = createPagination({ page, pageCount, siblings });

  if (items.length === 0) {
    return null;
  }

  const safePage = Math.min(Math.max(1, Math.trunc(page)), Math.max(1, Math.trunc(pageCount)));

  const handlePageChange = (nextPage: number) => {
    const clamped = Math.min(Math.max(1, nextPage), Math.max(1, Math.trunc(pageCount)));
    if (clamped === safePage) return;
    if (disabled) return;
    onPageChange?.(clamped);
  };

  const prevDisabled = disabled || safePage <= 1;
  const nextDisabled = disabled || safePage >= Math.max(1, Math.trunc(pageCount));

  return (
    <nav
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs shadow-sm",
        "dark:border-slate-800 dark:bg-slate-950",
        className
      )}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => handlePageChange(safePage - 1)}
        disabled={prevDisabled}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition",
          "hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
          "focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50",
          "dark:hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-slate-200 dark:focus-visible:ring-offset-slate-900"
        )}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3 text-current">
          <path d="M11.7 5.45a.75.75 0 010 1.05L8.73 9.5l2.97 3a.75.75 0 11-1.06 1.06l-3.5-3.52a.75.75 0 010-1.06l3.5-3.5a.75.75 0 011.06 0z" fill="currentColor" />
        </svg>
        <span>{previousLabel}</span>
      </button>
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          if (typeof item === "number") {
            const isActive = item === safePage;
            return (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => handlePageChange(item)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex min-w-[32px] items-center justify-center rounded-md px-2 py-1 text-xs font-semibold transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
                    "focus-visible:ring-offset-white disabled:cursor-not-allowed",
                    isActive
                      ? "bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)] shadow-inner"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
                    "dark:focus-visible:ring-offset-slate-900",
                    !isActive && "dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                  )}
                  disabled={disabled}
                >
                  {item}
                </button>
              </li>
            );
          }

          const ariaLabel = item === "ellipsis-left" ? "Collapsed previous pages" : "Collapsed next pages";
          return (
            <li key={`${item}-${index}`} className="px-1 text-slate-400" aria-label={ariaLabel}>
              <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3">
                <circle cx="6" cy="10" r="1.1" fill="currentColor" />
                <circle cx="10" cy="10" r="1.1" fill="currentColor" />
                <circle cx="14" cy="10" r="1.1" fill="currentColor" />
              </svg>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={() => handlePageChange(safePage + 1)}
        disabled={nextDisabled}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition",
          "hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
          "focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50",
          "dark:hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-slate-200 dark:focus-visible:ring-offset-slate-900"
        )}
      >
        <span>{nextLabel}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3 text-current">
          <path d="M8.3 14.55a.75.75 0 010-1.05l2.97-3.01-2.97-3a.75.75 0 011.06-1.06l3.5 3.52a.75.75 0 010 1.06l-3.5 3.5a.75.75 0 01-1.06 0z" fill="currentColor" />
        </svg>
      </button>
    </nav>
  );
}

export type { PaginationProps };
