import "server-only";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { serviceTypeIdSchema } from "@/features/service-types/schemas/service-type-schema";
import type { ServiceType } from "@/features/service-types/types/service-type";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

export async function getServiceTypeById(
  organizationSlug: string,
  serviceTypeId: string,
): Promise<ServiceType | null> {
  const parsedId = serviceTypeIdSchema.safeParse(serviceTypeId);

  if (!parsedId.success) {
    return null;
  }

  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_types")
    .select("id, name, description, active, updated_at")
    .eq("id", parsedId.data)
    .eq("organization_id", context.organization.id)
    .maybeSingle();

  if (error) {
    throw new Error("Não foi possível carregar o tipo de atendimento.");
  }

  return data;
}
