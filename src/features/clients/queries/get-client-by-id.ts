import "server-only";

import { clientIdSchema } from "@/features/clients/schemas/client-schema";
import type { ClientDetails } from "@/features/clients/types/client";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

export async function getClientById(
  organizationSlug: string,
  clientId: string,
): Promise<ClientDetails | null> {
  const parsedId = clientIdSchema.safeParse(clientId);

  if (!parsedId.success) {
    return null;
  }

  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      "id, legal_name, trade_name, tax_id, segment, notes, active, updated_at",
    )
    .eq("id", parsedId.data)
    .eq("organization_id", context.organization.id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar o cliente.");
  }

  return data;
}
