import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-shell/app-header";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import type { OrganizationRole, UserOrganization } from "@/features/organizations/types/organization";

export function AppShell({
  children,
  currentOrganization,
  organizations,
  profile,
  role,
}: {
  children: ReactNode;
  currentOrganization: UserOrganization;
  organizations: UserOrganization[];
  profile: { name: string; email: string };
  role: OrganizationRole;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a href="#conteudo-principal" className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:translate-y-0">
        Ir para o conteúdo
      </a>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <AppSidebar currentOrganization={currentOrganization} role={role} />
      </aside>
      <div className="lg:pl-64">
        <AppHeader currentOrganization={currentOrganization} organizations={organizations} profile={profile} role={role} />
        <main id="conteudo-principal" tabIndex={-1} className="min-w-0 overflow-x-clip outline-none [&>main]:min-h-[calc(100dvh-4rem)] [&>main]:bg-transparent">{children}</main>
      </div>
    </div>
  );
}
