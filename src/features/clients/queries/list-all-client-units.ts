import "server-only";

import type {
  ClientUnitListFilters,
  ClientUnitListResult,
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

export async function listAllClientUnits(
  organizationSlug: string,
  filters: ClientUnitListFilters,
): Promise<ClientUnitListResult> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  const pageSize = filters.pageSize;
  let query = supabase
    .from("client_units")
    .select(
      "id, client_id, name, tax_id, address_line, address_number, address_complement, district, city, state, postal_code, contact_name, contact_email, contact_phone, access_instructions, notes, active, updated_at, client:clients!client_units_client_fkey(id, legal_name, trade_name, active)",
      { count: "exact" },
    )
    .eq("organization_id", context.organization.id)
    .order("name", { ascending: true });

  if (filters.query) {
    const pattern = quoteFilterValue(
      `%${escapeLikePattern(filters.query)}%`,
    );
    query = query.or(
      `name.ilike.${pattern},city.ilike.${pattern},state.ilike.${pattern}`,
    );
  }

  if (filters.status !== "all") {
    query = query.eq("active", filters.status === "active");
  }

  const from = (filters.page - 1) * pageSize;
  const { data, error, count } = await query.range(
    from,
    from + pageSize - 1,
  );

  if (error) {
    throw new Error("Não foi possível carregar as unidades.");
  }

  const total = count ?? 0;
  return {
    items: data,
    page: filters.page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
