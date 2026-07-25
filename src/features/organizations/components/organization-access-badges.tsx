import { Badge } from "@/components/ui/badge";
import {
  organizationMemberStatusLabels,
  organizationRoleLabels,
  type OrganizationMemberStatus,
  type OrganizationRole,
} from "@/features/organizations/types/organization";

export function OrganizationRoleBadge({ role }: { role: OrganizationRole }) {
  const tones = { admin: "primary", coordinator: "info", technician: "neutral" } as const;
  return <Badge tone={tones[role]}>{organizationRoleLabels[role]}</Badge>;
}

export function OrganizationMemberStatusBadge({ status }: { status: OrganizationMemberStatus }) {
  const tones = { invited: "warning", active: "success", blocked: "danger" } as const;
  return <Badge tone={tones[status]}>{organizationMemberStatusLabels[status]}</Badge>;
}
