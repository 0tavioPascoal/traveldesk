import { Badge } from "@/components/ui/badge";
import { InlineAlert } from "@/components/ui/inline-alert";
import { OrganizationMemberStatusBadge, OrganizationRoleBadge } from "@/features/organizations/components/organization-access-badges";
import type { CurrentOrganizationMemberDetails } from "@/features/organizations/types/organization";

function formatDate(value: string, timezone: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: timezone }).format(new Date(value));
  } catch {
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
  }
}

export function CurrentMemberOverview({ member, timezone }: { member: CurrentOrganizationMemberDetails; timezone: string }) {
  const name = member.profile.name?.trim() || "Usuário";
  const email = member.profile.email?.trim() || "E-mail não informado";
  return (
    <section id="membros" aria-labelledby="members-title" className="scroll-mt-24 space-y-5 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div><h2 id="members-title" className="text-lg font-semibold text-card-foreground">Membros e acessos</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Consulte seu vínculo, papel e situação dentro desta organização.</p></div>
      <InlineAlert>A infraestrutura atual permite consultar apenas o próprio vínculo. A gestão dos demais membros ainda não possui operações administrativas seguras habilitadas.</InlineAlert>
      <div className="hidden overflow-hidden rounded-xl border border-border lg:block">
        <table className="w-full table-fixed text-left text-sm"><thead className="border-b border-border bg-muted/70 text-xs uppercase tracking-wide text-muted-foreground"><tr><th scope="col" className="px-4 py-3 font-semibold">Membro</th><th scope="col" className="w-40 px-4 py-3 font-semibold">Papel</th><th scope="col" className="w-32 px-4 py-3 font-semibold">Situação</th><th scope="col" className="w-48 px-4 py-3 font-semibold">Vínculo</th><th scope="col" className="w-48 px-4 py-3 font-semibold">Atualização</th></tr></thead><tbody><tr><td className="px-4 py-4"><div className="flex items-center gap-2"><div className="min-w-0"><p className="truncate font-semibold text-card-foreground">{name}</p><p className="truncate text-muted-foreground">{email}</p></div><Badge tone="neutral">Você</Badge></div></td><td className="px-4 py-4"><OrganizationRoleBadge role={member.role} /></td><td className="px-4 py-4"><OrganizationMemberStatusBadge status={member.status} /></td><td className="px-4 py-4 text-muted-foreground">Desde {formatDate(member.created_at, timezone)}</td><td className="px-4 py-4 text-muted-foreground">{formatDate(member.updated_at, timezone)}</td></tr></tbody></table>
      </div>
      <article className="rounded-xl border border-border p-4 lg:hidden"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="break-words font-semibold text-card-foreground">{name}</h3><Badge tone="neutral">Você</Badge></div><p className="mt-1 break-all text-sm text-muted-foreground">{email}</p></div><OrganizationMemberStatusBadge status={member.status} /></div><div className="mt-4 flex flex-wrap items-center gap-2"><OrganizationRoleBadge role={member.role} /><span className="text-xs text-muted-foreground">Membro desde {formatDate(member.created_at, timezone)}</span></div></article>
    </section>
  );
}
