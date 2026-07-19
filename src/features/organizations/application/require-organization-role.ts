import "server-only";

import { notFound } from "next/navigation";

import { requireOrganizationMember } from "@/features/organizations/application/require-organization-member";
import type {
  OrganizationContext,
  OrganizationRole,
} from "@/features/organizations/types/organization";

export async function requireOrganizationRole(
  organizationSlug: string,
  allowedRoles: readonly OrganizationRole[],
): Promise<OrganizationContext> {
  const context = await requireOrganizationMember(organizationSlug);

  if (!allowedRoles.includes(context.membership.role)) {
    notFound();
  }

  return context;
}
