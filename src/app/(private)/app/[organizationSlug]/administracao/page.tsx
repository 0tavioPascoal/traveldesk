import { notFound } from "next/navigation";

import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { AdministrationNavigation } from "@/features/organizations/components/administration-navigation";
import { CurrentMemberOverview } from "@/features/organizations/components/current-member-overview";
import { OrganizationOverview } from "@/features/organizations/components/organization-overview";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { getCurrentOrganizationMemberDetails } from "@/features/organizations/queries/get-current-organization-member-details";
import { getOrganizationAdministrationDetails } from "@/features/organizations/queries/get-organization-administration-details";

export default async function AdministrationPage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin"] as const);
  const [organization, member] = await Promise.all([
    getOrganizationAdministrationDetails(context.organization.id),
    getCurrentOrganizationMemberDetails(context.organization.id, context.membership.profileId),
  ]);

  if (!organization || !member) notFound();

  return (
    <PageContainer className="max-w-6xl space-y-6">
      <PageHeader title="Administração" description="Consulte as informações e o acesso administrativo da organização." breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Administração" }]} />
      <AdministrationNavigation />
      <OrganizationOverview organization={organization} />
      <CurrentMemberOverview member={member} timezone={organization.timezone} />
    </PageContainer>
  );
}
