import type { ReactNode } from "react";
import { cn } from "./utils/cn";

type NavbarLink = {
  id?: string;
  label: string;
  href?: string;
  active?: boolean;
  icon?: ReactNode;
  onSelect?: () => void;
};

type NavbarProps = {
  brand?: ReactNode;
  links?: NavbarLink[];
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  dense?: boolean;
};

export function Navbar({
  brand,
  links = [],
  actions,
  children,
  className,
  dense = false,
}: NavbarProps) {
  return (
    <nav
      role="navigation"
      className={cn(
        "retro-toolbar flex w-full items-center justify-between gap-4 border-b px-5",
        dense ? "h-11" : "h-14",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-5">
        {brand && (
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted">
            {brand}
          </div>
        )}
        {links.length > 0 && (
          <ul className="flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.18em] text-subtle">
            {links.map(link => {
              const isActive = Boolean(link.active);
              const content = (
                <span className="inline-flex items-center gap-2">
                  {link.icon && <span className="text-muted">{link.icon}</span>}
                  <span className="truncate">{link.label}</span>
                </span>
              );

              const baseClasses = cn(
                "flex items-center gap-2 border border-transparent px-3 py-2 transition",
                "hover:border-[var(--control-border)] hover:bg-control-hover",
                isActive && "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)]"
              );

              if (link.href) {
                return (
                  <li key={link.id ?? link.href}>
                    <a href={link.href} className={baseClasses} onClick={link.onSelect}>
                      {content}
                    </a>
                  </li>
                );
              }

              return (
                <li key={link.id ?? link.label}>
                  <button type="button" className={baseClasses} onClick={link.onSelect}>
                    {content}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="ml-auto flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.18em] text-muted">
        {children}
        {actions}
      </div>
    </nav>
  );
}

export type { NavbarLink, NavbarProps };
