import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import type { TripConfirmationCheck, TripConfirmationReadiness } from "@/features/trips/types/trip-confirmation";
import type { TripOvernightSummary } from "@/features/trips/types/trip-overnight";
import type { TripTeamSummary, TripTechnicianCandidates } from "@/features/trips/types/trip-staffing";
import type { TripTransportSummary } from "@/features/trips/types/trip-transport";
import type { TripDetails } from "@/features/trips/types/trip";
import { createClient } from "@/lib/supabase/server";

function check(
  condition: boolean,
  code: string,
  title: string,
  success: string,
  failure: string,
): TripConfirmationCheck {
  return { code, title, status: condition ? "ready" : "problem", message: condition ? success : failure };
}

export async function getTripConfirmationReadiness(
  organizationSlug: string,
  trip: TripDetails,
  team: TripTeamSummary,
  candidates: TripTechnicianCandidates,
  transport: TripTransportSummary,
  overnights: TripOvernightSummary,
): Promise<TripConfirmationReadiness> {
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const supabase = await createClient();
  const [clientResult, unitResult, serviceTypeResult] = await Promise.all([
    supabase.from("clients").select("active").eq("organization_id", context.organization.id).eq("id", trip.client_id).maybeSingle(),
    supabase.from("client_units").select("active, client_id").eq("organization_id", context.organization.id).eq("id", trip.client_unit_id).maybeSingle(),
    trip.service_type_id
      ? supabase.from("service_types").select("active").eq("organization_id", context.organization.id).eq("id", trip.service_type_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);
  if (clientResult.error || unitResult.error || serviceTypeResult.error) {
    throw new Error("Não foi possível verificar os cadastros relacionados à viagem.");
  }

  const mainDataComplete = Boolean(
    trip.title.trim().length >= 3 && trip.service_type_id
      && trip.origin_city && trip.origin_state && trip.destination_city && trip.destination_state,
  );
  const validPeriod = Boolean(
    trip.travel_starts_at && trip.travel_ends_at
      && trip.service_starts_at && trip.service_ends_at
      && new Date(trip.travel_starts_at).getTime() < new Date(trip.travel_ends_at).getTime()
      && new Date(trip.travel_starts_at).getTime() <= new Date(trip.service_starts_at).getTime()
      && new Date(trip.service_starts_at).getTime() < new Date(trip.service_ends_at).getTime()
      && new Date(trip.service_ends_at).getTime() <= new Date(trip.travel_ends_at).getTime(),
  );
  const relationshipsActive = Boolean(
    clientResult.data?.active
      && unitResult.data?.active && unitResult.data.client_id === trip.client_id
      && serviceTypeResult.data?.active,
  );
  const exactlyOneResponsible = team.technicians.filter((item) => item.isResponsible).length === 1;
  const techniciansAvailable = team.technicians.length > 0 && team.technicians.every((technician) => {
    const candidate = candidates.items.find((item) => item.id === technician.technicianId);
    return technician.active && candidate !== undefined && candidate.unavailableReason === null;
  });
  const transportReady = Boolean(transport.assignment) && transport.assignmentValid;
  const capacityValid = Boolean(
    transport.assignment && transport.teamSize <= transport.assignment.passengerCapacity,
  );
  const driverEligible = Boolean(
    transport.assignment && transport.drivers.some((driver) =>
      driver.technicianId === transport.assignment?.driverTechnicianId && driver.group === "eligible"),
  );
  const checks = [
    check(mainDataComplete, "main_data", "Dados principais", "Dados principais completos.", "Complete os dados principais da viagem."),
    check(validPeriod, "period", "Períodos", "Períodos válidos.", "Revise os períodos da viagem e do atendimento."),
    check(relationshipsActive, "relationships", "Cliente e atendimento", "Cadastros relacionados ativos.", "Cliente, unidade ou tipo de atendimento está inativo."),
    check(team.technicians.length > 0, "team", "Equipe técnica", "Equipe definida.", "Adicione ao menos um técnico."),
    check(exactlyOneResponsible, "responsible", "Técnico responsável", "Responsável definido.", "Defina exatamente um técnico responsável."),
    check(team.coverage.complete, "coverage", "Cobertura das especialidades", "Todos os requisitos estão cobertos.", team.coverage.requirements.filter((item) => !item.covered).length
      ? `Faltam: ${team.coverage.requirements.filter((item) => !item.covered).map((item) => item.skillName).join(", ")}.`
      : "A equipe não cobre os requisitos técnicos."),
    check(techniciansAvailable, "availability", "Disponibilidade da equipe", "Técnicos disponíveis.", "Existe técnico inativo, indisponível ou com conflito."),
    check(transportReady, "transport", "Veículo", "Veículo disponível e reservado.", transport.assignment ? transport.assignmentIssues[0] ?? "Revise o veículo reservado." : "Reserve um veículo."),
    check(capacityValid, "capacity", "Capacidade", "Capacidade suficiente.", "O veículo não comporta toda a equipe."),
    check(driverEligible, "driver", "Motorista", "Motorista elegível.", "Defina um motorista alocado, apto e com CNH válida."),
    check(overnights.effectiveOvernights !== null, "overnights_calculated", "Cálculo de pernoites", "Pernoites calculados.", "Calcule os pernoites."),
    check(!overnights.isOutdated, "overnights_current", "Atualização dos pernoites", "Cálculo atualizado.", "O cálculo de pernoites está desatualizado."),
    check(overnights.isReviewed, "overnights_reviewed", "Revisão dos pernoites", "Pernoites revisados.", "Revise os pernoites antes de confirmar."),
  ];
  return { ready: trip.status === "planned" && checks.every((item) => item.status === "ready"), checks };
}
