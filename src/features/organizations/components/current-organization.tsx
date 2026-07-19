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
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
        TravelDesk
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
        {context.organization.name}
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Papel atual: {organizationRoleLabels[context.membership.role]}
      </p>
    </div>
  );
}
