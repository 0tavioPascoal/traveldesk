import "server-only";

import { digitsOnly } from "@/features/clients/schemas/brazilian-fields";
import type {
  ClientFilters,
  ClientListItem,
} from "@/features/clients/types/client";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

function quoteFilterValue(value: string) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function listClients(
  organizationSlug: string,
  filters: ClientFilters,
): Promise<ClientListItem[]> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select(
      "id, legal_name, trade_name, tax_id, active, updated_at, client_units(count)",
    )
    .eq("organization_id", context.organization.id)
    .order("legal_name", { ascending: true });

  if (filters.query) {
    const clauses = [
      `legal_name.ilike.${quoteFilterValue(`%${escapeLikePattern(filters.query)}%`)}`,
      `trade_name.ilike.${quoteFilterValue(`%${escapeLikePattern(filters.query)}%`)}`,
    ];
    const documentQuery = digitsOnly(filters.query);

    if (documentQuery) {
      clauses.push(`tax_id.ilike.${quoteFilterValue(`%${documentQuery}%`)}`);
    }

    query = query.or(clauses.join(","));
  }

  if (filters.status !== "all") {
    query = query.eq("active", filters.status === "active");
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Não foi possível carregar os clientes.");
  }

  return data.map(({ client_units: unitCounts, ...client }) => ({
    ...client,
    unitCount: unitCounts[0]?.count ?? 0,
  }));
}
