import { Plus } from "lucide-react";
import Link from "next/link";

import {
  ListPageContent,
  ListPageFooter,
  ListPageShell,
} from "@/components/list-page/list-page-shell";
import { ListPagination } from "@/components/list-page/list-pagination";
import { ListToolbar } from "@/components/list-page/list-toolbar";
import { RefreshListButton } from "@/components/list-page/refresh-list-button";
import { PageHeader } from "@/components/page/page-header";
import { buttonStyles } from "@/components/ui/button";
import { InlineAlert } from "@/components/ui/inline-alert";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { ServiceTypeFilters } from "@/features/service-types/components/service-type-filters";
import { ServiceTypeList } from "@/features/service-types/components/service-type-list";
import { listServiceTypes } from "@/features/service-types/queries/list-service-types";
import { serviceTypeFilterSchema } from "@/features/service-types/schemas/service-type-filter-schema";

type ServiceTypesPageProps = {
  params: Promise<{ organizationSlug: string }>;
  searchParams: Promise<{
    query?: string | string[];
    status?: string | string[];
    feedback?: string | string[];
  }>;
};

const administrativeRoles = ["admin", "coordinator"] as const;

function getFeedback(value: string | string[] | undefined) {
  const feedback = Array.isArray(value) ? value[0] : value;

  if (feedback === "created") {
    return "Tipo de atendimento cadastrado com sucesso.";
  }

  if (feedback === "updated") {
    return "Tipo de atendimento atualizado com sucesso.";
  }

  return null;
}

export default async function ServiceTypesPage({
  params,
  searchParams,
}: ServiceTypesPageProps) {
  const [{ organizationSlug }, queryParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const filters = serviceTypeFilterSchema.parse({
    query: queryParams.query,
    status: queryParams.status,
  });
  const [context, serviceTypes] = await Promise.all([
    requireOrganizationRole(organizationSlug, administrativeRoles),
    listServiceTypes(organizationSlug, filters),
  ]);
  const feedback = getFeedback(queryParams.feedback);
  const hasFilters = filters.query !== "" || filters.status !== "all";

  return (
    <ListPageShell>
        <PageHeader title="Tipos de atendimento" description="Gerencie as categorias utilizadas para classificar os atendimentos técnicos." breadcrumbs={[{ label: "Cadastros" }, { label: "Tipos de atendimento" }]} />

        {feedback ? (
          <InlineAlert tone="success">{feedback}</InlineAlert>
        ) : null}

        <ListToolbar actions={<><Link href={`/app/${organizationSlug}/cadastros/tipos-atendimento/novo`} className={buttonStyles({ size: "sm" })}><Plus aria-hidden="true" className="size-4" />Novo tipo de atendimento</Link><RefreshListButton /></>}>
          <ServiceTypeFilters
            organizationSlug={organizationSlug}
            filters={filters}
          />
        </ListToolbar>

        <ListPageContent>
          <ServiceTypeList
              organizationSlug={organizationSlug}
              serviceTypes={serviceTypes}
              timezone={context.organization.timezone}
              hasFilters={hasFilters}
          />
        </ListPageContent>
        <ListPageFooter>
          <ListPagination ariaLabel="Resumo de tipos de atendimento" page={1} totalPages={1} total={serviceTypes.length} pageSize={Math.max(serviceTypes.length, 1)} itemName={{ singular: "tipo de atendimento", plural: "tipos de atendimento" }} href={() => `/app/${organizationSlug}/cadastros/tipos-atendimento`} />
        </ListPageFooter>
    </ListPageShell>
  );
}
