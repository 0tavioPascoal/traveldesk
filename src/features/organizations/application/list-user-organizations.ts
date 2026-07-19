import "server-only";

import { getCurrentProfile } from "@/features/organizations/application/get-current-profile";
import type { UserOrganization } from "@/features/organizations/types/organization";
import { createClient } from "@/lib/supabase/server";

export async function listUserOrganizations(): Promise<UserOrganization[]> {
  const profile = await getCurrentProfile();

  if (!profile?.active) {
    return [];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
        id,
        role,
        organization:organizations!inner (
          id,
          name,
          slug,
          timezone,
          active
        )
      `,
    )
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .eq("organizations.active", true);

  if (error || !data) {
    return [];
  }

  return data
    .map(({ id, organization, role }) => ({
      id: organization.id,
      membershipId: id,
      name: organization.name,
      role,
      slug: organization.slug,
      timezone: organization.timezone,
    }))
    .sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
}
