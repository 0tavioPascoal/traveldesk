import "server-only";

import type { ClientUnitFormInput } from "@/features/clients/schemas/client-unit-schema";
import type { ClientUnitMutationResult } from "@/features/clients/types/client";
import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { createClient } from "@/lib/supabase/server";

const administrativeRoles = ["admin", "coordinator"] as const;

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function duplicateReason(message: string) {
  return message.includes("client_units_organization_tax_id_key")
    ? "duplicate_tax_id"
    : "duplicate_name";
}

export async function createClientUnit(
  organizationSlug: string,
  input: ClientUnitFormInput,
): Promise<ClientUnitMutationResult> {
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const supabase = await createClient();
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, active")
    .eq("id", input.clientId)
    .eq("organization_id", context.organization.id)
    .maybeSingle();

  if (clientError) {
    return { success: false, reason: "unexpected" };
  }

  if (!client) {
    return { success: false, reason: "client_not_found" };
  }

  if (!client.active) {
    return { success: false, reason: "client_inactive" };
  }

  const name = input.name.trim();
  const [nameResult, taxIdResult] = await Promise.all([
    supabase
      .from("client_units")
      .select("id")
      .eq("organization_id", context.organization.id)
      .eq("client_id", input.clientId)
      .ilike("name", escapeLikePattern(name))
      .limit(1)
      .maybeSingle(),
    input.taxId
      ? supabase
          .from("client_units")
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
    return { success: false, reason: "duplicate_name" };
  }

  if (taxIdResult.data) {
    return { success: false, reason: "duplicate_tax_id" };
  }

  const { error } = await supabase.from("client_units").insert({
    organization_id: context.organization.id,
    client_id: input.clientId,
    name,
    tax_id: input.taxId,
    address_line: input.addressLine?.trim() || null,
    address_number: input.addressNumber?.trim() || null,
    address_complement: input.addressComplement?.trim() || null,
    district: input.district?.trim() || null,
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    postal_code: input.postalCode,
    contact_name: input.contactName?.trim() || null,
    contact_email: input.contactEmail?.trim().toLowerCase() || null,
    contact_phone: input.contactPhone,
    access_instructions: input.accessInstructions?.trim() || null,
    notes: input.notes?.trim() || null,
    active: true,
    created_by: context.membership.profileId,
    updated_by: context.membership.profileId,
  });

  if (!error) {
    return { success: true };
  }

  if (error.code === "42501") {
    return { success: false, reason: "client_inactive" };
  }

  return {
    success: false,
    reason:
      error.code === "23505" ? duplicateReason(error.message) : "unexpected",
  };
}
