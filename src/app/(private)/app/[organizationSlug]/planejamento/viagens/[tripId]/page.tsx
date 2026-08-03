import { notFound } from "next/navigation";

import { PageContainer } from "@/components/page/page-container";
import { Breadcrumb } from "@/components/page/breadcrumb";
import { InlineAlert } from "@/components/ui/inline-alert";
import { requireOrganizationMember } from "@/features/organizations/application/require-organization-member";
import { listActiveSkills } from "@/features/skills/queries/list-active-skills";
import { TripDetails } from "@/features/trips/components/trip-details";
import { TripActionsMenu } from "@/features/trips/components/trip-actions-menu";
import { TripDetailHeader } from "@/features/trips/components/trip-detail-header";
import { TripDetailsNavigation } from "@/features/trips/components/trip-details-navigation";
import { TripHistorySection } from "@/features/trips/components/trip-history-section";
import { TripOperationalSummary } from "@/features/trips/components/trip-operational-summary";
import { TripPrimaryAction } from "@/features/trips/components/trip-primary-action";
import { TripExecutionSection } from "@/features/trips/components/trip-execution-section";
import { TripConfirmationSection } from "@/features/trips/components/trip-confirmation-section";
import { TripOvernightSection } from "@/features/trips/components/trip-overnight-section";
import { TripTeamSection } from "@/features/trips/components/trip-team-section";
import { TripTransportSection } from "@/features/trips/components/trip-transport-section";
import { TechnicianOperationalTripDetails } from "@/features/trips/components/technician-operational-trip-details";
import { getTripById } from "@/features/trips/queries/get-trip-by-id";
import { getTripConfirmationReadiness } from "@/features/trips/queries/get-trip-confirmation-readiness";
import { getTripExecutionSummary } from "@/features/trips/queries/get-trip-execution-summary";
import { getTripOvernightSummary } from "@/features/trips/queries/get-trip-overnight-summary";
import { getTripTeamSummary } from "@/features/trips/queries/get-trip-team-summary";
import { getTripTransportSummary } from "@/features/trips/queries/get-trip-transport-summary";
import { listAvailableTechniciansForTrip } from "@/features/trips/queries/list-available-technicians-for-trip";
import { listTechnicianOperationalTrips } from "@/features/trips/queries/list-technician-operational-trips";
import { tripIdSchema } from "@/features/trips/schemas/trip-schema";

type Props = {
  params: Promise<{ organizationSlug: string; tripId: string }>;
  searchParams: Promise<{ feedback?: string | string[] }>;
};

export default async function TripPage({ params, searchParams }: Props) {
  const { organizationSlug, tripId } = await params;
  const parsedId = tripIdSchema.safeParse(tripId);
  if (!parsedId.success) notFound();
  const memberContext = await requireOrganizationMember(organizationSlug);

  if (memberContext.membership.role === "technician") {
    const [trip] = await listTechnicianOperationalTrips(organizationSlug, parsedId.data, 1);
    if (!trip) notFound();
    const execution = await getTripExecutionSummary(organizationSlug, trip.id, trip.status);
    return (
      <PageContainer className="max-w-5xl space-y-6">
        <TechnicianOperationalTripDetails
          organizationSlug={organizationSlug}
          timezone={memberContext.organization.timezone}
          trip={trip}
          execution={execution}
        />
      </PageContainer>
    );
  }

  const context = memberContext;
  const [trip, query] = await Promise.all([
    getTripById(organizationSlug, parsedId.data),
    searchParams,
  ]);
  if (!trip) notFound();
  const [summary, candidates, activeSkills, transport, overnights] = await Promise.all([
    getTripTeamSummary(organizationSlug, trip.id),
    listAvailableTechniciansForTrip(organizationSlug, trip.id),
    listActiveSkills(organizationSlug),
    getTripTransportSummary(organizationSlug, trip.id),
    getTripOvernightSummary(organizationSlug, trip.id),
  ]);
  const skillOptions = [
    ...activeSkills.map((skill) => ({ ...skill, active: true })),
    ...summary.requirements
      .filter((requirement) => !requirement.skillActive && !activeSkills.some((skill) => skill.id === requirement.skillId))
      .map((requirement) => ({ id: requirement.skillId, name: requirement.skillName, active: false })),
  ];
  const [readiness, execution] = await Promise.all([
    trip.status === "planned" ? getTripConfirmationReadiness(
      organizationSlug, trip, summary, candidates, transport, overnights,
    ) : Promise.resolve(null),
    getTripExecutionSummary(organizationSlug, trip.id, trip.status),
  ]);
  const feedback = Array.isArray(query.feedback) ? query.feedback[0] : query.feedback;
  const role = context.membership.role as "admin" | "coordinator";
  const navigation = [
    { id: "visao-geral", label: "Visão geral" },
    { id: "equipe", label: "Equipe" },
    { id: "transporte", label: "Transporte" },
    { id: "pernoites", label: "Pernoites" },
    ...(readiness || trip.confirmed_at ? [{ id: "confirmacao", label: "Confirmação" }] : []),
    { id: "execucao", label: "Execução" },
    { id: "historico", label: "Histórico" },
  ];

  return (
    <PageContainer className="space-y-6">
        <Breadcrumb items={[
          { label: "Visão geral", href: `/app/${organizationSlug}/dashboard` },
          { label: "Viagens", href: `/app/${organizationSlug}/planejamento/viagens` },
          { label: trip.code },
        ]} />
        {feedback === "created" || feedback === "updated" ? (
          <InlineAlert tone="success">
            {feedback === "created" ? "Viagem cadastrada com sucesso." : "Viagem atualizada com sucesso."}
          </InlineAlert>
        ) : null}
        <TripDetailHeader
          trip={trip}
          timezone={context.organization.timezone}
          primaryAction={<TripPrimaryAction organizationSlug={organizationSlug} tripId={trip.id} status={trip.status} readiness={readiness} execution={execution} />}
          additionalActions={<TripActionsMenu organizationSlug={organizationSlug} tripId={trip.id} code={trip.code} status={trip.status} role={role} confirmedAt={trip.confirmed_at} />}
        />
        <TripOperationalSummary trip={trip} timezone={context.organization.timezone} team={summary} transport={transport} overnights={overnights} readiness={readiness} execution={execution} />
        <TripDetailsNavigation items={navigation} />
        <div id="visao-geral" className="scroll-mt-36"><TripDetails
          trip={trip}
          timezone={context.organization.timezone}
        /></div>
        <div id="equipe" className="scroll-mt-36">
          <TripTeamSection
            organizationSlug={organizationSlug}
            tripId={trip.id}
            status={trip.status}
            summary={summary}
            candidates={candidates}
            skillOptions={skillOptions}
          />
        </div>
        <div id="transporte" className="scroll-mt-36">
          <TripTransportSection
            organizationSlug={organizationSlug}
            tripId={trip.id}
            status={trip.status}
            summary={transport}
            timezone={context.organization.timezone}
          />
        </div>
        <div id="pernoites" className="scroll-mt-36">
          <TripOvernightSection
            organizationSlug={organizationSlug}
            tripId={trip.id}
            tripStatus={trip.status}
            summary={overnights}
            timezone={context.organization.timezone}
          />
        </div>
        {readiness || trip.confirmed_at ? <div id="confirmacao" className="scroll-mt-36"><TripConfirmationSection readiness={readiness} confirmedAt={trip.confirmed_at} timezone={context.organization.timezone} /></div> : null}
        <div id="execucao" className="scroll-mt-36"><TripExecutionSection summary={execution} timezone={context.organization.timezone} /></div>
        <div id="historico" className="scroll-mt-36"><TripHistorySection summary={execution} timezone={context.organization.timezone} /></div>
    </PageContainer>
  );
}
