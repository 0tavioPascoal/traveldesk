import Link from "next/link";
import { Car, MapPin } from "lucide-react";

import {
  DataTableShell,
  dataTableHeaderStyles,
  dataTableStyles,
} from "@/components/list-page/data-table-shell";
import {
  MobileRecordCard,
  MobileRecordList,
} from "@/components/list-page/mobile-record-list";
import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { NoResultsState } from "@/components/ui/no-results-state";
import { getTechnicianLicenseState, technicianLicenseLabel, formatDateOnly } from "@/features/technicians/application/technician-presentation";
import { TechnicianRowActions } from "@/features/technicians/components/technician-row-actions";
import type { TechnicianListItem } from "@/features/technicians/types/technician";

function formatCpf(value: string | null) {
  return value?.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4") ?? null;
}

function Secondary({ technician }: { technician: TechnicianListItem }) {
  return <p className="mt-1 truncate text-sm text-muted-foreground">{technician.email ?? formatCpf(technician.document) ?? technician.job_title ?? "Sem contato informado"}</p>;
}

function Skills({ technician }: { technician: TechnicianListItem }) {
  if (technician.skills.length === 0) return <span className="text-sm text-muted-foreground">Nenhuma especialidade</span>;
  const shown = technician.skills.slice(0, 2);
  const remaining = technician.skills.slice(2);
  return <div className="flex flex-wrap gap-1.5">{shown.map((skill) => <Badge key={skill.skillId} tone={skill.isPrimary ? "primary" : "neutral"} className={!skill.skillActive ? "opacity-60" : ""}>{skill.skillName}{skill.isPrimary ? " · Principal" : ""}</Badge>)}{remaining.length ? <span title={remaining.map((skill) => skill.skillName).join(", ")}><Badge tone="neutral">+{remaining.length}</Badge></span> : null}</div>;
}

function License({ technician, referenceDate }: { technician: TechnicianListItem; referenceDate: string }) {
  const state = getTechnicianLicenseState(technician, referenceDate);
  if (state === "not_authorized") return <span className="text-sm text-muted-foreground">Não autorizado a dirigir</span>;
  return <div className="text-sm"><p className="font-medium text-foreground">{technicianLicenseLabel(state)}</p><p className="mt-0.5 text-muted-foreground">{technician.driver_license_category ? `Categoria ${technician.driver_license_category}` : "Categoria não informada"}{technician.driver_license_expires_at ? ` · até ${formatDateOnly(technician.driver_license_expires_at)}` : ""}</p></div>;
}

function Availability({ technician, timezone }: { technician: TechnicianListItem; timezone: string }) {
  if (!technician.availability) return <p className="text-sm font-medium text-success">Sem indisponibilidade</p>;
  const format = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: timezone });
  if (technician.availability.kind === "current") return <div><p className="text-sm font-medium text-warning">Indisponível</p><p className="mt-0.5 text-xs text-muted-foreground">até {format.format(new Date(technician.availability.endsAt))}</p></div>;
  return <div><p className="text-sm font-medium text-foreground">Indisponibilidade futura</p><p className="mt-0.5 text-xs text-muted-foreground">em {format.format(new Date(technician.availability.startsAt))}</p></div>;
}

export function TechnicianList({ organizationSlug, technicians, timezone, referenceDate, hasFilters }: { organizationSlug: string; technicians: TechnicianListItem[]; timezone: string; referenceDate: string; hasFilters: boolean }) {
  const base = `/app/${organizationSlug}/cadastros/tecnicos`;
  if (technicians.length === 0) return hasFilters
    ? <NoResultsState description="Revise os filtros ou limpe a pesquisa." action={{ href: base, label: "Limpar filtros" }} />
    : <EmptyState title="Nenhum técnico cadastrado" description="Cadastre o primeiro técnico para começar a organizar as viagens e especialidades." action={{ href: `${base}/novo`, label: "Novo técnico" }} />;

  return <>
    <DataTableShell>
      <table className={`${dataTableStyles} table-fixed`}>
        <thead className={dataTableHeaderStyles}><tr><th scope="col" className="w-[22%] px-4 py-3">Técnico</th><th data-list-column="technicians:skills" scope="col" className="w-[22%] px-4 py-3">Especialidades</th><th data-list-column="technicians:base" scope="col" className="w-[13%] px-4 py-3">Localidade-base</th><th data-list-column="technicians:license" scope="col" className="w-[19%] px-4 py-3">Habilitação</th><th data-list-column="technicians:availability" scope="col" className="w-[13%] px-4 py-3">Disponibilidade</th><th scope="col" className="w-[8%] px-4 py-3">Situação</th><th scope="col" className="w-20 px-2 py-3 text-right">Ações</th></tr></thead>
        <tbody className="divide-y divide-border">{technicians.map((technician) => <tr key={technician.id} className="align-top hover:bg-muted/30">
          <td className="px-4 py-4"><Link href={`${base}/${technician.id}`} className="font-semibold text-foreground hover:text-primary hover:underline">{technician.name}</Link><Secondary technician={technician} /></td>
          <td data-list-column="technicians:skills" className="px-4 py-4"><Skills technician={technician} /></td>
          <td data-list-column="technicians:base" className="px-4 py-4 text-sm text-foreground">{technician.base_city}/{technician.base_state}</td>
          <td data-list-column="technicians:license" className="px-4 py-4"><License technician={technician} referenceDate={referenceDate} /></td>
          <td data-list-column="technicians:availability" className="px-4 py-4"><Availability technician={technician} timezone={timezone} /></td>
          <td className="px-4 py-4"><ActiveStatusBadge active={technician.active} /></td>
          <td className="px-2 py-3"><TechnicianRowActions organizationSlug={organizationSlug} technicianId={technician.id} technicianName={technician.name} active={technician.active} /></td>
        </tr>)}</tbody>
      </table>
    </DataTableShell>
    <MobileRecordList label="Técnicos cadastrados">{technicians.map((technician) => <MobileRecordCard key={technician.id}>
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><Link href={`${base}/${technician.id}`} className="font-semibold text-foreground hover:underline">{technician.name}</Link><Secondary technician={technician} /></div><ActiveStatusBadge active={technician.active} /></div>
      <div data-list-column="technicians:skills" className="mt-3"><Skills technician={technician} /></div>
      <div className="mt-4 grid gap-2.5 text-sm sm:grid-cols-2"><p data-list-column="technicians:base" className="flex items-center gap-2 text-muted-foreground"><MapPin aria-hidden="true" className="size-4 shrink-0" /><span>{technician.base_city}/{technician.base_state}</span></p><div data-list-column="technicians:license" className="flex gap-2 text-muted-foreground"><Car aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><License technician={technician} referenceDate={referenceDate} /></div></div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3"><div data-list-column="technicians:availability"><Availability technician={technician} timezone={timezone} /></div><TechnicianRowActions organizationSlug={organizationSlug} technicianId={technician.id} technicianName={technician.name} active={technician.active} /></div>
    </MobileRecordCard>)}</MobileRecordList>
  </>;
}
