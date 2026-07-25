import { redirect } from "next/navigation";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";

export default async function UnavailabilityTypesPage({ params }: { params: Promise<{ organizationSlug: string }> }) {
  const { organizationSlug } = await params;
  await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  redirect(`/app/${organizationSlug}/cadastros/tipos-indisponibilidade/tecnicos`);
}
