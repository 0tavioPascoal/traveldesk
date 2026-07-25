import { PageContainer } from "@/components/page/page-container";
import { PageHeader } from "@/components/page/page-header";
import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import { InlineAlert } from "@/components/ui/inline-alert";
import { dateInTimezone } from "@/features/technicians/application/technician-presentation";
import { TechnicianDetailActions } from "@/features/technicians/components/technician-detail-actions";
import { TechnicianDetails } from "@/features/technicians/components/technician-details";
import { TechnicianProfileLink } from "@/features/technicians/components/technician-profile-link";
import { getAvailableProfilesForTechnicianLink } from "@/features/technicians/queries/get-available-profiles-for-technician-link";
import { getTechnicianById } from "@/features/technicians/queries/get-technician-by-id";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { listTechnicianUpcomingUnavailabilities } from "@/features/unavailabilities/queries/list-technician-upcoming-unavailabilities";

type Props = { params: Promise<{ organizationSlug: string; technicianId: string }>; searchParams: Promise<{ feedback?: string | string[] }> };
export default async function TechnicianPage({ params, searchParams }: Props) {
  const { organizationSlug, technicianId } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const [technician, query, unavailabilityMap] = await Promise.all([
    getTechnicianById(organizationSlug, technicianId),
    searchParams,
    listTechnicianUpcomingUnavailabilities(organizationSlug, [technicianId]),
  ]);
  const profiles = context.membership.role === "admin" ? await getAvailableProfilesForTechnicianLink(organizationSlug, technicianId) : [];
  const feedback = Array.isArray(query.feedback) ? query.feedback[0] : query.feedback;
  const now = new Date();
  const referenceDate = dateInTimezone(now, context.organization.timezone);
  const feedbackMessage = feedback === "created" ? "Técnico cadastrado com sucesso." : feedback === "updated" ? "Técnico atualizado com sucesso." : null;
  return <PageContainer className="max-w-7xl space-y-6">
    <PageHeader title={technician.name} eyebrow={technician.job_title ?? "Técnico"} description={[technician.email, `${technician.base_city}/${technician.base_state}`].filter(Boolean).join(" · ")} breadcrumbs={[{ label: "Visão geral", href: `/app/${organizationSlug}/dashboard` }, { label: "Técnicos", href: `/app/${organizationSlug}/cadastros/tecnicos` }, { label: technician.name }]} actions={<div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"><ActiveStatusBadge active={technician.active} /><TechnicianDetailActions organizationSlug={organizationSlug} technicianId={technicianId} technicianName={technician.name} active={technician.active} /></div>} />
    {feedbackMessage ? <InlineAlert tone="success">{feedbackMessage}</InlineAlert> : null}
    <TechnicianDetails organizationSlug={organizationSlug} technician={technician} timezone={context.organization.timezone} referenceDate={referenceDate} referenceTime={now.toISOString()} unavailabilities={unavailabilityMap.get(technicianId) ?? []} />
    {context.membership.role === "admin" ? <TechnicianProfileLink organizationSlug={organizationSlug} technicianId={technicianId} profileId={technician.profile_id} profiles={profiles} /> : null}
  </PageContainer>;
}
