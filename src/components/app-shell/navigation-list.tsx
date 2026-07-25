"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getNavigationSections } from "@/components/app-shell/navigation";
import type { OrganizationRole } from "@/features/organizations/types/organization";

export function NavigationList({
  organizationSlug,
  role,
  onNavigate,
}: {
  organizationSlug: string;
  role: OrganizationRole;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const sections = getNavigationSections(organizationSlug, role);

  return (
    <nav aria-label="Navegação principal" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {sections.map((section, index) => (
        <div key={section.label ?? index}>
          {section.label ? (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {section.label}
            </p>
          ) : null}
          <ul className="space-y-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-3 rounded-lg border-l-2 px-3 text-sm font-medium transition-colors ${
                      active
                        ? "border-sidebar-accent-foreground bg-sidebar-accent text-sidebar-accent-foreground"
                        : "border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-5 shrink-0" />
                    <span>{item.label}</span>
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
