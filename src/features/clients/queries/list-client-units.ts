import "server-only";

import { clientIdSchema } from "@/features/clients/schemas/client-schema";
import type {
  ClientUnit,
  ClientUnitFilters,
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

export async function listClientUnits(
  organizationSlug: string,
  clientId: string,
  filters: ClientUnitFilters,
): Promise<ClientUnit[]> {
  const parsedClientId = clientIdSchema.safeParse(clientId);

  if (!parsedClientId.success) {
    return [];
  }

  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  let query = supabase
    .from("client_units")
    .select(
      "id, client_id, name, tax_id, address_line, address_number, address_complement, district, city, state, postal_code, contact_name, contact_email, contact_phone, access_instructions, notes, active, updated_at",
    )
    .eq("organization_id", context.organization.id)
    .eq("client_id", parsedClientId.data)
    .order("name", { ascending: true });

  if (filters.query) {
    const pattern = quoteFilterValue(
      `%${escapeLikePattern(filters.query)}%`,
    );
    query = query.or(`name.ilike.${pattern},city.ilike.${pattern}`);
  }

  if (filters.status !== "all") {
    query = query.eq("active", filters.status === "active");
  }

  const { data, error } = await query;

  if (error) {
    throw new Error("Não foi possível carregar as unidades do cliente.");
  }

  return data;
}
