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
        "inline-flex items-center gap-2 border border-transparent px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-muted transition",
        "hover:border-[var(--control-border)] hover:bg-control-hover",
        "focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
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
        "inline-flex items-center gap-2 border border-transparent px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-muted transition",
        "hover:border-[var(--control-border)] hover:bg-control-hover",
        "focus-visible:outline-double focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2",
        className
      )}
      {...props}
    />
  );
});

export function Breadcrumb({ items, separator, className }: BreadcrumbProps) {
  const effectiveSeparator = separator ?? (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3 text-muted">
      <path d="M7.7 5.45a.75.75 0 011.05-.15l4 3a.75.75 0 010 1.2l-4 3a.75.75 0 01-.9-1.2l3-2.25-3-2.25a.75.75 0 01-.15-1.05z" fill="currentColor" />
    </svg>
  );

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 border border-[var(--control-border)] bg-[var(--window-bg)] px-2.5 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-muted shadow-[0_4px_16px_rgba(9,18,27,0.2)]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const content = (
            <span
              className={cn(
                "inline-flex items-center gap-2",
                isLast ? "font-semibold text-[var(--accent-muted-foreground)]" : undefined
              )}
            >
              {item.icon && <span className="text-muted">{item.icon}</span>}
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
                    "inline-flex items-center gap-2 px-2 py-1",
                    isLast ? "font-semibold text-[var(--accent-muted-foreground)]" : "text-muted"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {content}
                </span>
              )}
              {!isLast && <span className="text-muted">{effectiveSeparator}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type { BreadcrumbItem, BreadcrumbProps };
