import {
  organizationRoleLabels,
  type OrganizationContext,
} from "@/features/organizations/types/organization";

type CurrentOrganizationProps = {
  context: OrganizationContext;
};

export function CurrentOrganization({ context }: CurrentOrganizationProps) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        TravelDesk
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {context.organization.name}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Papel atual: {organizationRoleLabels[context.membership.role]}
      </p>
    </div>
  );
}
