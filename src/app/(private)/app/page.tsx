import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/features/auth/application/require-authenticated-user";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { listUserOrganizations } from "@/features/organizations/application/list-user-organizations";
import { NoOrganizationsState } from "@/features/organizations/components/no-organizations-state";
import { OrganizationSelector } from "@/features/organizations/components/organization-selector";

export default async function AppPage() {
  const user = await requireAuthenticatedUser();
  const organizations = await listUserOrganizations();

  if (organizations.length === 1) {
    redirect(`/app/${organizations[0].slug}/dashboard`);
  }

  return (
    <main className="min-h-screen flex-1 bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              TravelDesk
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
              Organizações
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Conectado como {user.email}
            </p>
          </div>

          <LogoutButton />
        </header>

        {organizations.length === 0 ? (
          <NoOrganizationsState />
        ) : (
          <OrganizationSelector organizations={organizations} />
        )}
      </div>
    </main>
  );
}
