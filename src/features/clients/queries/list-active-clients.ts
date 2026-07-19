import "server-only";

import type { ActiveClient } from "@/features/clients/types/client";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

export async function listActiveClients(
  organizationSlug: string,
): Promise<ActiveClient[]> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, legal_name, trade_name")
    .eq("organization_id", context.organization.id)
    .eq("active", true)
    .order("legal_name", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar os clientes ativos.");
  }

  return data;
}
