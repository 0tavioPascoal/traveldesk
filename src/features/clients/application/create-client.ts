import "server-only";

import type { ClientFormInput } from "@/features/clients/schemas/client-schema";
import type { ClientMutationResult } from "@/features/clients/types/client";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function duplicateReason(message: string) {
  return message.includes("clients_organization_tax_id_key")
    ? "duplicate_tax_id"
    : "duplicate_legal_name";
}

export async function createClient(
  organizationSlug: string,
  input: ClientFormInput,
): Promise<ClientMutationResult> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const legalName = input.legalName.trim();
  const supabase = await createSupabaseClient();
  const [nameResult, taxIdResult] = await Promise.all([
    supabase
      .from("clients")
      .select("id")
      .eq("organization_id", context.organization.id)
      .ilike("legal_name", escapeLikePattern(legalName))
      .limit(1)
      .maybeSingle(),
    input.taxId
      ? supabase
          .from("clients")
          .select("id")
          .eq("organization_id", context.organization.id)
          .eq("tax_id", input.taxId)
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (nameResult.error || taxIdResult.error) {
    return { success: false, reason: "unexpected" };
  }

  if (nameResult.data) {
    return { success: false, reason: "duplicate_legal_name" };
  }

  if (taxIdResult.data) {
    return { success: false, reason: "duplicate_tax_id" };
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      organization_id: context.organization.id,
      legal_name: legalName,
      trade_name: input.tradeName?.trim() || null,
      tax_id: input.taxId,
      segment: input.segment?.trim() || null,
      notes: input.notes?.trim() || null,
      active: true,
      created_by: context.membership.profileId,
      updated_by: context.membership.profileId,
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      reason:
        error.code === "23505"
          ? duplicateReason(error.message)
          : "unexpected",
    };
  }

  return { success: true, clientId: data.id };
}
