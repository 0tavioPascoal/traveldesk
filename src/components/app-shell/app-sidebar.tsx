import { BriefcaseBusiness } from "lucide-react";

import { NavigationList } from "@/components/app-shell/navigation-list";
import type { OrganizationRole, UserOrganization } from "@/features/organizations/types/organization";

export function AppSidebar({
  currentOrganization,
  role,
  onNavigate,
}: {
  currentOrganization: UserOrganization;
  role: OrganizationRole;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
          <BriefcaseBusiness aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight">TravelDesk</p>
          <p className="truncate text-xs text-muted-foreground">Operações técnicas</p>
        </div>
      </div>
      <div className="border-b border-sidebar-border px-4 py-3">
        <p className="truncate text-xs text-muted-foreground">Organização</p>
        <p className="truncate text-sm font-semibold">{currentOrganization.name}</p>
      </div>
      <NavigationList organizationSlug={currentOrganization.slug} role={role} onNavigate={onNavigate} />
    </div>
  );
}
