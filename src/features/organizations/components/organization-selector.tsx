import Link from "next/link";

import {
  organizationRoleLabels,
  type UserOrganization,
} from "@/features/organizations/types/organization";

type OrganizationSelectorProps = {
  organizations: UserOrganization[];
};

export function OrganizationSelector({
  organizations,
}: OrganizationSelectorProps) {
  return (
    <section aria-labelledby="organizations-title" className="mt-6">
      <div className="mb-4">
        <h2
          id="organizations-title"
          className="text-lg font-semibold text-foreground"
        >
          Selecione uma organização
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha em qual empresa deseja trabalhar.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {organizations.map((organization) => (
          <li key={organization.id}>
            <Link
              href={`/app/${organization.slug}/dashboard`}
              className="block rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm transition hover:border-input hover:bg-muted/40 hover:shadow"
            >
              <span className="block font-semibold text-card-foreground">
                {organization.name}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                {organizationRoleLabels[organization.role]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
