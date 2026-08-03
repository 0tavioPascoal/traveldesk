import { requireAuthenticatedUser } from "@/features/auth/application/require-authenticated-user";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { listUserOrganizations } from "@/features/organizations/application/list-user-organizations";
import { NoOrganizationsState } from "@/features/organizations/components/no-organizations-state";
import { OrganizationRedirect } from "@/features/organizations/components/organization-redirect";
import { OrganizationSelector } from "@/features/organizations/components/organization-selector";

export default async function AppPage() {
  const user = await requireAuthenticatedUser();
  const organizations = await listUserOrganizations();

  if (organizations.length === 1) {
    return <OrganizationRedirect organizationSlug={organizations[0].slug} />;
  }

  return (
    <main className="min-h-screen flex-1 bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              TravelDesk
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-card-foreground">
              Organizações
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Conectado como {user.email}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
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
