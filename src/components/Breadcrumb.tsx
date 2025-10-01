import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../utils/cn";

type BreadcrumbItemBase = {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

type BreadcrumbLinkItem = BreadcrumbItemBase & {
  href: string;
  onSelect?: never;
};

type BreadcrumbButtonItem = BreadcrumbItemBase & {
  onSelect: () => void;
  href?: undefined;
};

type BreadcrumbStaticItem = BreadcrumbItemBase & {
  href?: undefined;
  onSelect?: undefined;
};

type BreadcrumbItem = BreadcrumbLinkItem | BreadcrumbButtonItem | BreadcrumbStaticItem;

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
};

type BreadcrumbButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const BreadcrumbButton = forwardRef<HTMLButtonElement, BreadcrumbButtonProps>(function BreadcrumbButton(
  { className, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2 rounded px-2 py-1 text-xs font-medium tracking-wide text-slate-500 transition",
        "hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "dark:hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-slate-200 dark:focus-visible:ring-offset-slate-900",
        className
      )}
      {...props}
    />
  );
});

const BreadcrumbLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function BreadcrumbLink(
  { className, ...props },
  ref
) {
  return (
    <a
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2 rounded px-2 py-1 text-xs font-medium tracking-wide text-slate-500 transition",
        "hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "dark:hover:bg-slate-800/60 dark:text-slate-400 dark:hover:text-slate-200 dark:focus-visible:ring-offset-slate-900",
        className
      )}
      {...props}
    />
  );
});

export function Breadcrumb({ items, separator, className }: BreadcrumbProps) {
  const effectiveSeparator = separator ?? (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3 text-slate-400">
      <path d="M7.7 5.45a.75.75 0 011.05-.15l4 3a.75.75 0 010 1.2l-4 3a.75.75 0 01-.9-1.2l3-2.25-3-2.25a.75.75 0 01-.15-1.05z" fill="currentColor" />
    </svg>
  );

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = (
            <span
              className={cn(
                "inline-flex items-center gap-2",
                isLast ? "font-semibold text-slate-700 dark:text-slate-50" : undefined
              )}
            >
              {item.icon && <span className="text-slate-400">{item.icon}</span>}
              <span>{item.label}</span>
            </span>
          );

          return (
            <li key={item.id} className="flex items-center gap-1">
              {item.href ? (
                <BreadcrumbLink
                  href={item.href}
                  aria-current={isLast ? "page" : undefined}
                  tabIndex={item.disabled ? -1 : 0}
                  onClick={event => {
                    if (item.disabled) {
                      event.preventDefault();
                    }
                  }}
                  className={item.disabled ? "pointer-events-none opacity-60" : undefined}
                >
                  {content}
                </BreadcrumbLink>
              ) : item.onSelect && !isLast ? (
                <BreadcrumbButton
                  type="button"
                  onClick={() => {
                    if (item.disabled) return;
                    item.onSelect();
                  }}
                  className={item.disabled ? "cursor-not-allowed opacity-60" : undefined}
                  aria-disabled={item.disabled || undefined}
                >
                  {content}
                </BreadcrumbButton>
              ) : (
                <span
                  className={cn(
                    "inline-flex items-center gap-2 px-2 py-1 text-xs",
                    isLast ? "font-semibold text-slate-700 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {content}
                </span>
              )}
              {!isLast && <span className="text-slate-400">{effectiveSeparator}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type { BreadcrumbItem, BreadcrumbProps };
