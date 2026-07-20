import Link from "next/link";
import { TechnicianDetails } from "@/features/technicians/components/technician-details";
import { TechnicianProfileLink } from "@/features/technicians/components/technician-profile-link";
import { getAvailableProfilesForTechnicianLink } from "@/features/technicians/queries/get-available-profiles-for-technician-link";
import { getTechnicianById } from "@/features/technicians/queries/get-technician-by-id";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";

type Props = { params: Promise<{ organizationSlug: string; technicianId: string }>; searchParams: Promise<{ feedback?: string | string[] }> };
export default async function TechnicianPage({ params, searchParams }: Props) {
  const { organizationSlug, technicianId } = await params;
  const context = await requireOrganizationRole(organizationSlug, ["admin", "coordinator"] as const);
  const [technician, query] = await Promise.all([getTechnicianById(organizationSlug, technicianId), searchParams]);
  const profiles = context.membership.role === "admin" ? await getAvailableProfilesForTechnicianLink(organizationSlug, technicianId) : [];
  const feedback = Array.isArray(query.feedback) ? query.feedback[0] : query.feedback;
  return <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6"><div className="mx-auto max-w-5xl space-y-6"><header><Link href={`/app/${organizationSlug}/cadastros/tecnicos`} className="text-sm font-medium text-zinc-600">← Voltar aos técnicos</Link><h1 className="mt-2 text-2xl font-bold">Detalhes do técnico</h1></header>{feedback ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{feedback === "created" ? "Técnico cadastrado com sucesso." : "Técnico atualizado com sucesso."}</p> : null}<TechnicianDetails organizationSlug={organizationSlug} technician={technician} timezone={context.organization.timezone} />{context.membership.role === "admin" ? <TechnicianProfileLink organizationSlug={organizationSlug} technicianId={technicianId} profileId={technician.profile_id} profiles={profiles} /> : null}</div></main>;
}
