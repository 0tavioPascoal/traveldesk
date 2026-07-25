import Link from "next/link";
import { CalendarOff, Car, MapPin, ShieldCheck, Wrench } from "lucide-react";

import { SectionHeader } from "@/components/page/section-header";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { formatDateOnly, getTechnicianLicenseState, technicianLicenseLabel } from "@/features/technicians/application/technician-presentation";
import type { TechnicianDetails as Details } from "@/features/technicians/types/technician";
import type { UnavailabilityListItem } from "@/features/unavailabilities/types/unavailability";

function formatCpf(value: string | null) { return value ? value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4") : "Não informado"; }
function formatPhone(value: string | null) { return value ? value.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3") : "Não informado"; }
function Field({ label, value, mono = false, className = "" }: { label: string; value: string; mono?: boolean; className?: string }) { return <div className={className}><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className={`mt-1 text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</dd></div>; }

function formatPeriod(item: UnavailabilityListItem, timezone: string) {
  const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: timezone });
  const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: timezone });
  if (item.allDay) return `${date.format(new Date(item.startsAt))} a ${date.format(new Date(new Date(item.endsAt).getTime() - 1))} · dia inteiro`;
  return `${dateTime.format(new Date(item.startsAt))} a ${dateTime.format(new Date(item.endsAt))}`;
}

export function TechnicianDetails({ organizationSlug, technician, timezone, referenceDate, referenceTime, unavailabilities }: { organizationSlug: string; technician: Details; timezone: string; referenceDate: string; referenceTime: string; unavailabilities: UnavailabilityListItem[] }) {
  const updatedAt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: timezone }).format(new Date(technician.updated_at));
  const primarySkill = technician.skills.find((skill) => skill.isPrimary);
  const licenseState = getTechnicianLicenseState(technician, referenceDate);
  const referenceTimestamp = new Date(referenceTime).getTime();
  const currentUnavailability = unavailabilities.find((item) => new Date(item.startsAt).getTime() <= referenceTimestamp);
  const nextUnavailability = currentUnavailability ?? unavailabilities[0];
  const unavailabilityPath = `/app/${organizationSlug}/planejamento/indisponibilidades?resource=technicians&resourceId=${technician.id}`;

  return <div className="space-y-6">
    {!technician.active ? <InlineAlert tone="warning">Este técnico está inativo e permanece disponível apenas para consulta e histórico.</InlineAlert> : null}
    <section aria-label="Resumo operacional" className="grid overflow-hidden rounded-2xl border border-border bg-card sm:grid-cols-2 xl:grid-cols-5">
      {[
        { icon: Wrench, label: "Especialidades", value: `${technician.skills.length} ${technician.skills.length === 1 ? "cadastrada" : "cadastradas"}` },
        { icon: ShieldCheck, label: "Principal", value: primarySkill?.skillName ?? "Não definida" },
        { icon: MapPin, label: "Base", value: `${technician.base_city}/${technician.base_state}` },
        { icon: Car, label: "Habilitação", value: technicianLicenseLabel(licenseState) },
        { icon: CalendarOff, label: "Disponibilidade", value: currentUnavailability ? `Indisponível até ${new Intl.DateTimeFormat("pt-BR", { timeZone: timezone }).format(new Date(currentUnavailability.endsAt))}` : nextUnavailability ? `Próxima em ${new Intl.DateTimeFormat("pt-BR", { timeZone: timezone }).format(new Date(nextUnavailability.startsAt))}` : "Sem indisponibilidades atuais" },
      ].map(({ icon: Icon, label, value }, index) => <div key={label} className={`flex gap-3 p-4 sm:p-5 ${index < 4 ? "border-b border-border xl:border-b-0 xl:border-r" : ""} ${index % 2 === 0 ? "sm:border-r xl:border-r" : ""}`}><Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-sm font-medium text-foreground">{value}</p></div></div>)}
    </section>

    <nav aria-label="Seções do técnico" className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1"><a href="#visao-geral" className={buttonStyles({ variant: "ghost", size: "sm" })}>Visão geral</a><a href="#especialidades" className={buttonStyles({ variant: "ghost", size: "sm" })}>Especialidades</a><a href="#habilitacao" className={buttonStyles({ variant: "ghost", size: "sm" })}>Habilitação</a><a href="#indisponibilidades" className={buttonStyles({ variant: "ghost", size: "sm" })}>Indisponibilidades</a></nav>

    <section id="visao-geral" aria-labelledby="technician-overview-title" className="scroll-mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6"><SectionHeader id="technician-overview-title" title="Visão geral" description="Dados pessoais, profissionais e cadastrais do técnico." /><dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3"><Field label="Nome" value={technician.name} /><Field label="CPF" value={formatCpf(technician.document)} mono /><Field label="E-mail" value={technician.email ?? "Não informado"} /><Field label="Telefone" value={formatPhone(technician.phone)} /><Field label="Cargo ou função" value={technician.job_title ?? "Não informado"} /><Field label="Localidade-base" value={`${technician.base_city}/${technician.base_state}`} /><Field label="Situação" value={technician.active ? "Ativo" : "Inativo"} /><Field label="Perfil de acesso" value={technician.profile_id ? "Vinculado" : "Não vinculado"} /><Field label="Atualizado em" value={updatedAt} /><Field label="Observações" value={technician.notes ?? "Nenhuma observação registrada."} className="sm:col-span-2 lg:col-span-3 whitespace-pre-wrap" /></dl></section>

    <section id="especialidades" aria-labelledby="technician-skills-title" className="scroll-mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6"><SectionHeader id="technician-skills-title" title="Especialidades" description="Competências técnicas utilizadas na alocação das viagens." actions={<Link href={`/app/${organizationSlug}/cadastros/tecnicos/${technician.id}/editar#especialidades`} className={buttonStyles({ variant: "secondary", size: "sm" })}>{technician.skills.length ? "Gerenciar" : "Adicionar especialidade"}</Link>} />
      {technician.skills.length ? <div className="mt-5 overflow-hidden rounded-xl border border-border"><table className="hidden w-full text-left md:table"><thead className="bg-muted/70 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><tr><th scope="col" className="px-4 py-3">Especialidade</th><th scope="col" className="px-4 py-3">Proficiência</th><th scope="col" className="px-4 py-3">Vínculo</th><th scope="col" className="px-4 py-3">Situação</th></tr></thead><tbody className="divide-y divide-border">{technician.skills.map((skill) => <tr key={skill.skillId}><td className="px-4 py-4 text-sm font-medium">{skill.skillName}</td><td className="px-4 py-4"><p className="text-sm">Nível {skill.proficiencyLevel} de 5</p><div aria-hidden="true" className="mt-2 flex gap-1">{[1,2,3,4,5].map((level) => <span key={level} className={`h-1.5 w-6 rounded-full ${level <= skill.proficiencyLevel ? "bg-primary" : "bg-muted"}`} />)}</div></td><td className="px-4 py-4"><Badge tone={skill.isPrimary ? "primary" : "neutral"}>{skill.isPrimary ? "Principal" : "Secundária"}</Badge></td><td className="px-4 py-4 text-sm text-muted-foreground">{skill.skillActive ? "Ativa" : "Especialidade inativa"}</td></tr>)}</tbody></table><ul className="divide-y divide-border md:hidden">{technician.skills.map((skill) => <li key={skill.skillId} className="space-y-2 p-4"><div className="flex items-start justify-between gap-3"><p className="font-medium">{skill.skillName}</p><Badge tone={skill.isPrimary ? "primary" : "neutral"}>{skill.isPrimary ? "Principal" : "Secundária"}</Badge></div><p className="text-sm text-muted-foreground">Nível {skill.proficiencyLevel} de 5 · {skill.skillActive ? "Ativa" : "Especialidade inativa"}</p></li>)}</ul></div> : <p className="mt-5 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhuma especialidade associada.</p>}
    </section>

    <section id="habilitacao" aria-labelledby="technician-license-title" className="scroll-mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6"><SectionHeader id="technician-license-title" title="Habilitação" description="Autorização e dados usados na validação de motoristas." />{licenseState === "not_authorized" ? <p className="mt-5 rounded-xl bg-muted p-4 text-sm text-muted-foreground">Não autorizado a dirigir veículos da empresa.</p> : <><div className="mt-5"><Badge tone={licenseState === "valid" ? "success" : licenseState === "expired" ? "danger" : "warning"}>{technicianLicenseLabel(licenseState)}</Badge></div><dl className="mt-5 grid gap-5 sm:grid-cols-3"><Field label="CNH" value={technician.driver_license_number ?? "Não informada"} mono /><Field label="Categoria" value={technician.driver_license_category ?? "Não informada"} /><Field label="Validade" value={formatDateOnly(technician.driver_license_expires_at)} /></dl></>}</section>

    <section id="indisponibilidades" aria-labelledby="technician-unavailability-title" className="scroll-mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6"><SectionHeader id="technician-unavailability-title" title="Indisponibilidades" description="Períodos atuais e futuros em que o técnico não pode ser alocado." actions={technician.active ? <Link href={`/app/${organizationSlug}/planejamento/indisponibilidades/tecnicos/nova?technicianId=${technician.id}`} className={buttonStyles({ variant: "secondary", size: "sm" })}>Registrar indisponibilidade</Link> : undefined} />
      {unavailabilities.length ? <ul className="mt-5 divide-y divide-border rounded-xl border border-border">{unavailabilities.slice(0, 5).map((item) => { const current = new Date(item.startsAt).getTime() <= referenceTimestamp; return <li key={item.id} className="grid gap-2 p-4 sm:grid-cols-[minmax(10rem,0.7fr)_minmax(14rem,1fr)_minmax(10rem,1fr)]"><div><p className="font-medium">{item.typeName}</p><Badge tone={current ? "warning" : "info"} className="mt-2">{current ? "Em andamento" : "Futura"}</Badge></div><p className="text-sm text-foreground">{formatPeriod(item, timezone)}</p><p className="text-sm text-muted-foreground">{item.reason ?? "Motivo não informado"}</p></li>; })}</ul> : <p className="mt-5 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Nenhuma indisponibilidade atual ou futura.</p>}
      <div className="mt-4"><Link href={unavailabilityPath} className="text-sm font-semibold text-primary hover:underline">Visualizar todas as indisponibilidades</Link></div>
    </section>
  </div>;
}
