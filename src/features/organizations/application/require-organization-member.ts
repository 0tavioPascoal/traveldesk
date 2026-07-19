import "server-only";

import { notFound } from "next/navigation";

import { requireAuthenticatedUser } from "@/features/auth/application/require-authenticated-user";
import { getOrganizationBySlug } from "@/features/organizations/application/get-organization-by-slug";
import type { OrganizationContext } from "@/features/organizations/types/organization";
import { createClient } from "@/lib/supabase/server";

export async function requireOrganizationMember(
  organizationSlug: string,
): Promise<OrganizationContext> {
  const user = await requireAuthenticatedUser();
  const organization = await getOrganizationBySlug(organizationSlug);

  if (!organization) {
    notFound();
  }

  const supabase = await createClient();
  const { data: membership, error } = await supabase
    .from("organization_members")
    .select("id, profile_id, role, status")
    .eq("organization_id", organization.id)
    .eq("profile_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (error || !membership || membership.status !== "active") {
    notFound();
  }

  return {
    organization,
    membership: {
      id: membership.id,
      profileId: membership.profile_id,
      role: membership.role,
      status: membership.status,
    },
  };
}
