"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { getNavigationSections } from "@/components/app-shell/navigation";
import type { OrganizationRole } from "@/features/organizations/types/organization";

function subscribeToHashChange(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getCurrentHash() {
  return window.location.hash;
}

export function NavigationList({
  compact = false,
  organizationSlug,
  role,
  onNavigate,
}: {
  compact?: boolean;
  organizationSlug: string;
  role: OrganizationRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const currentHash = useSyncExternalStore(
    subscribeToHashChange,
    getCurrentHash,
    () => "",
  );
  const sections = getNavigationSections(organizationSlug, role);

  return (
    <nav
      aria-label="Navegação principal"
      className={`flex-1 space-y-5 overflow-y-auto py-4 ${
        compact ? "px-2" : "px-3"
      }`}
    >
      {sections.map((section, index) => (
        <div key={section.label ?? index}>
          {section.label ? (
            <p
              className={
                compact
                  ? "sr-only"
                  : "mb-2 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              }
            >
              {section.label}
            </p>
          ) : null}
          <ul className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const [itemPath, itemFragment] = item.href.split("#");
              const pathMatches =
                pathname === itemPath || pathname.startsWith(`${itemPath}/`);
              const fragmentMatches =
                !itemFragment ||
                currentHash === `#${itemFragment}` ||
                (itemFragment === "organizacao" && currentHash === "");
              const active = pathMatches && fragmentMatches;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={compact ? item.label : undefined}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-lg border-l-2 py-2 text-sm font-medium transition-colors ${
                      compact ? "justify-center px-2" : "gap-3 px-3"
                    } ${
                      active
                        ? "border-sidebar-accent-foreground bg-sidebar-accent text-sidebar-accent-foreground"
                        : "border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-5 shrink-0" />
                    <span className={compact ? "sr-only" : undefined}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
