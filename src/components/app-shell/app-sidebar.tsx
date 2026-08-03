"use client";

import {
  BriefcaseBusiness,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useState } from "react";

import { NavigationList } from "@/components/app-shell/navigation-list";
import type { OrganizationRole, UserOrganization } from "@/features/organizations/types/organization";

export function AppSidebar({
  collapsible = false,
  currentOrganization,
  role,
  onNavigate,
}: {
  collapsible?: boolean;
  currentOrganization: UserOrganization;
  role: OrganizationRole;
  onNavigate?: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      data-collapsed={collapsible && collapsed ? "true" : "false"}
      className="app-sidebar flex h-full flex-col bg-sidebar text-sidebar-foreground"
    >
      <div
        className={`flex h-16 items-center gap-3 border-b border-sidebar-border ${
          collapsed ? "justify-center px-2" : "px-4"
        }`}
      >
        {collapsed ? (
          <button
            type="button"
            aria-label="Expandir sidebar"
            title="Expandir sidebar"
            onClick={() => setCollapsed((current) => !current)}
            className="grid size-10 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <PanelLeftOpen aria-hidden="true" className="size-5" />
          </button>
        ) : (
          <>
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <BriefcaseBusiness aria-hidden="true" className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold tracking-tight">TravelDesk</p>
              <p className="truncate text-xs text-muted-foreground">Operações técnicas</p>
            </div>
            {collapsible ? (
              <button
                type="button"
                aria-label="Recolher sidebar"
                title="Recolher sidebar"
                onClick={() => setCollapsed(true)}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <PanelLeftClose aria-hidden="true" className="size-4" />
              </button>
            ) : null}
          </>
        )}
      </div>
      {!collapsed ? (
        <div className="border-b border-sidebar-border px-4 py-3">
          <p className="truncate text-xs text-muted-foreground">Organização</p>
          <p className="truncate text-sm font-semibold">{currentOrganization.name}</p>
        </div>
      ) : null}
      <NavigationList
        compact={collapsed}
        organizationSlug={currentOrganization.slug}
        role={role}
        onNavigate={onNavigate}
      />
    </div>
  );
}
