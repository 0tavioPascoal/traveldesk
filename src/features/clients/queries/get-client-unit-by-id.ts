import "server-only";

import { clientIdSchema } from "@/features/clients/schemas/client-schema";
import { clientUnitIdSchema } from "@/features/clients/schemas/client-unit-schema";
import type { ClientUnit } from "@/features/clients/types/client";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

export async function getClientUnitById(
  organizationSlug: string,
  clientId: string,
  unitId: string,
): Promise<ClientUnit | null> {
  const [parsedClientId, parsedUnitId] = await Promise.all([
    clientIdSchema.safeParseAsync(clientId),
    clientUnitIdSchema.safeParseAsync(unitId),
  ]);

  if (!parsedClientId.success || !parsedUnitId.success) {
    return null;
  }

  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_units")
    .select(
      "id, client_id, name, tax_id, address_line, address_number, address_complement, district, city, state, postal_code, contact_name, contact_email, contact_phone, access_instructions, notes, active, updated_at",
    )
    .eq("id", parsedUnitId.data)
    .eq("client_id", parsedClientId.data)
    .eq("organization_id", context.organization.id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar a unidade.");
  }

  return data;
}
