import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import type { OrganizationAdministrationDetails } from "@/features/organizations/types/organization";

function formatTaxId(value: string | null) {
  const digits = value?.replace(/\D/g, "") ?? "";
  if (digits.length !== 14) return value ?? "Não informado";
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function formatDate(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short", timeZone: timezone }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  }
}

export function OrganizationOverview({ organization }: { organization: OrganizationAdministrationDetails }) {
  const fields = [
    ["Nome", organization.name],
    ["Razão social", organization.legal_name ?? "Não informada"],
    ["CNPJ ou identificador fiscal", formatTaxId(organization.tax_id)],
    ["Identificador", organization.slug],
    ["Fuso horário", organization.timezone],
    ["Criada em", formatDate(organization.created_at, organization.timezone)],
    ["Atualizada em", formatDate(organization.updated_at, organization.timezone)],
  ] as const;

  return (
    <section id="organizacao" aria-labelledby="organization-title" className="scroll-mt-24 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 id="organization-title" className="text-lg font-semibold text-card-foreground">Organização</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Informações principais e configurações regionais da empresa atual.</p></div>
        <ActiveStatusBadge active={organization.active} feminine />
      </div>
      <dl className="grid gap-x-8 gap-y-5 pt-5 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(([label, value]) => <div key={label} className={label === "Razão social" ? "sm:col-span-2" : ""}><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className={`mt-1 break-words text-sm font-medium text-card-foreground ${label === "Identificador" || label === "Fuso horário" ? "font-mono" : ""}`}>{value}</dd>{label === "Identificador" ? <p className="mt-1 text-xs leading-5 text-muted-foreground">Usado nas rotas da organização e disponível somente para consulta.</p> : null}{label === "Fuso horário" ? <p className="mt-1 text-xs leading-5 text-muted-foreground">Utilizado nos períodos de viagens, indisponibilidades e operações.</p> : null}</div>)}
      </dl>
    </section>
  );
}
