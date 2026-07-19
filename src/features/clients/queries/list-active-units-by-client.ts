import "server-only";

import { clientIdSchema } from "@/features/clients/schemas/client-schema";
import type { ActiveClientUnit } from "@/features/clients/types/client";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

export async function listActiveUnitsByClient(
  organizationSlug: string,
  clientId: string,
): Promise<ActiveClientUnit[]> {
  const parsedClientId = clientIdSchema.safeParse(clientId);

  if (!parsedClientId.success) {
    return [];
  }

  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id")
    .eq("id", parsedClientId.data)
    .eq("organization_id", context.organization.id)
    .eq("active", true)
    .maybeSingle();

  if (clientError) {
    throw new Error("Não foi possível validar o cliente.");
  }

  if (!client) {
    return [];
  }

  const { data, error } = await supabase
    .from("client_units")
    .select("id, name, city, state")
    .eq("organization_id", context.organization.id)
    .eq("client_id", parsedClientId.data)
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar as unidades ativas.");
  }

  return data;
}
