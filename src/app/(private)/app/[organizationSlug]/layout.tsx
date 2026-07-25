import { AppShell } from "@/components/app-shell/app-shell";
import { getCurrentProfile } from "@/features/organizations/application/get-current-profile";
import { listUserOrganizations } from "@/features/organizations/application/list-user-organizations";
import { requireOrganizationMember } from "@/features/organizations/application/require-organization-member";

export default async function OrganizationLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ organizationSlug: string }>;
}>) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationMember(organizationSlug);
  const [profile, organizations] = await Promise.all([getCurrentProfile(), listUserOrganizations()]);
  const currentOrganization = organizations.find((organization) => organization.id === context.organization.id) ?? {
    ...context.organization,
    membershipId: context.membership.id,
    role: context.membership.role,
  };

  return (
    <AppShell
      currentOrganization={currentOrganization}
      organizations={organizations.length > 0 ? organizations : [currentOrganization]}
      profile={{
        name: profile?.name ?? "Usuário",
        email: profile?.email ?? "",
      }}
      role={context.membership.role}
    >
      {children}
    </AppShell>
  );
}
