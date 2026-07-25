import { MobileSidebar } from "@/components/app-shell/mobile-sidebar";
import { OrganizationSwitcher } from "@/components/app-shell/organization-switcher";
import { UserMenu } from "@/components/app-shell/user-menu";
import type { OrganizationRole, UserOrganization } from "@/features/organizations/types/organization";

export function AppHeader({
  currentOrganization,
  organizations,
  profile,
  role,
}: {
  currentOrganization: UserOrganization;
  organizations: UserOrganization[];
  profile: { name: string; email: string };
  role: OrganizationRole;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <MobileSidebar currentOrganization={currentOrganization} role={role} />
      <OrganizationSwitcher currentOrganization={currentOrganization} organizations={organizations} />
      <div className="ml-auto"><UserMenu profile={profile} role={role} /></div>
    </header>
  );
}
