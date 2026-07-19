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
          className="text-lg font-semibold text-zinc-950"
        >
          Selecione uma organização
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          Escolha em qual empresa deseja trabalhar.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {organizations.map((organization) => (
          <li key={organization.id}>
            <Link
              href={`/app/${organization.slug}/dashboard`}
              className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-400 hover:shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
            >
              <span className="block font-semibold text-zinc-950">
                {organization.name}
              </span>
              <span className="mt-1 block text-sm text-zinc-600">
                {organizationRoleLabels[organization.role]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
