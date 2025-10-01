import type { ReactNode } from "react";
import { cn } from "../utils/cn";

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
        "flex w-full items-center justify-between gap-4 border-b border-slate-200 bg-white",
        "px-4",
        dense ? "h-12" : "h-14",
        "dark:border-slate-800 dark:bg-slate-950",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-4">
        {brand && <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{brand}</div>}
        {links.length > 0 && (
          <ul className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
            {links.map(link => {
              const isActive = Boolean(link.active);
              const content = (
                <span className="inline-flex items-center gap-2">
                  {link.icon && <span className="text-slate-400 dark:text-slate-500">{link.icon}</span>}
                  <span className="truncate">{link.label}</span>
                </span>
              );

              const baseClasses = cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2 transition-colors",
                "hover:bg-slate-100 hover:text-slate-900",
                "dark:hover:bg-slate-900/70 dark:hover:text-slate-100",
                isActive && "bg-[var(--accent-muted)] text-[var(--accent-muted-foreground)]"
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
      <div className="ml-auto flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        {children}
        {actions}
      </div>
    </nav>
  );
}

export type { NavbarLink, NavbarProps };
