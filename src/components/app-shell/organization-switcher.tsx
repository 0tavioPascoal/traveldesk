"use client";

import { usePathname, useRouter } from "next/navigation";

import type { UserOrganization } from "@/features/organizations/types/organization";

const moduleRoutes = [
  "/planejamento/viagens",
  "/planejamento/indisponibilidades",
  "/cadastros/clientes",
  "/cadastros/tecnicos",
  "/cadastros/veiculos",
  "/cadastros/especialidades",
  "/cadastros/tipos-atendimento",
  "/cadastros/tipos-indisponibilidade",
] as const;

function equivalentRoute(pathname: string, currentSlug: string, selected: UserOrganization) {
  if (selected.role === "technician") return "/dashboard";

  const prefix = `/app/${currentSlug}`;
  const suffix = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : "/dashboard";
  if (suffix === "/dashboard") return suffix;

  return moduleRoutes.find((route) => suffix === route || suffix.startsWith(`${route}/`)) ?? "/dashboard";
}

export function OrganizationSwitcher({
  currentOrganization,
  organizations,
}: {
  currentOrganization: UserOrganization;
  organizations: UserOrganization[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  function changeOrganization(slug: string) {
    const selected = organizations.find((organization) => organization.slug === slug);
    if (!selected || selected.slug === currentOrganization.slug) return;

    router.push(`/app/${selected.slug}${equivalentRoute(pathname, currentOrganization.slug, selected)}`);
  }

  return (
    <label className="relative block min-w-0">
      <span className="sr-only">Organização atual</span>
      <select
        value={currentOrganization.slug}
        onChange={(event) => changeOrganization(event.target.value)}
        className="h-10 max-w-48 truncate rounded-lg border border-input bg-card px-3 pr-8 text-sm font-medium text-card-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20 sm:max-w-60"
      >
        {organizations.map((organization) => (
          <option key={organization.id} value={organization.slug}>
            {organization.name} · {organization.role === "admin" ? "Administrador" : organization.role === "coordinator" ? "Coordenador" : "Técnico"}
          </option>
        ))}
      </select>
    </label>
  );
}
