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

export type OrganizationAdministrationDetails = Pick<
  Tables<"organizations">,
  | "name"
  | "legal_name"
  | "tax_id"
  | "slug"
  | "timezone"
  | "active"
  | "created_at"
  | "updated_at"
>;

export type CurrentOrganizationMemberDetails = Pick<
  Tables<"organization_members">,
  "role" | "status" | "created_at" | "updated_at"
> & {
  profile: Pick<Tables<"profiles">, "name" | "email">;
};

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

export const organizationMemberStatusLabels: Record<
  OrganizationMemberStatus,
  string
> = {
  invited: "Convidado",
  active: "Ativo",
  blocked: "Bloqueado",
};

export const organizationRoleDescriptions: Record<OrganizationRole, string> = {
  admin: "Possui acesso administrativo e operacional à organização.",
  coordinator: "Gerencia os cadastros e o planejamento operacional permitido.",
  technician: "Possui acesso restrito às operações liberadas para técnicos.",
};
