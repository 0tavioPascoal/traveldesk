import type { Enums, Tables } from "@/lib/supabase/database.types";

export type OrganizationRole = Enums<"organization_role">;
export type OrganizationMemberStatus = Enums<"organization_member_status">;

export type CurrentProfile = Pick<
  Tables<"profiles">,
  "id" | "name" | "email" | "phone" | "active"
>;

export type OrganizationSummary = Pick<
  Tables<"organizations">,
  "id" | "name" | "slug" | "timezone"
>;

export type UserOrganization = OrganizationSummary & {
  membershipId: string;
  role: OrganizationRole;
};

export type OrganizationContext = {
  organization: OrganizationSummary;
  membership: {
    id: string;
    profileId: string;
    role: OrganizationRole;
    status: Extract<OrganizationMemberStatus, "active">;
  };
};

export const organizationRoleLabels: Record<OrganizationRole, string> = {
  admin: "Administrador",
  coordinator: "Coordenador",
  technician: "Técnico",
};
