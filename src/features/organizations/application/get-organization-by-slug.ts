import "server-only";

import { getCurrentUser } from "@/features/auth/application/get-current-user";
import { organizationSlugSchema } from "@/features/organizations/schemas/organization-slug-schema";
import type { OrganizationSummary } from "@/features/organizations/types/organization";
import { createClient } from "@/lib/supabase/server";

export async function getOrganizationBySlug(
  slug: string,
): Promise<OrganizationSummary | null> {
  const [user, parsedSlug] = await Promise.all([
    getCurrentUser(),
    organizationSlugSchema.safeParseAsync(slug),
  ]);

  if (!user || !parsedSlug.success) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("id, name, slug, timezone")
    .eq("slug", parsedSlug.data)
    .eq("active", true)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}
