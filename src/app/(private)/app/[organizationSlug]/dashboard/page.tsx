import Link from "next/link";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { requireOrganizationMember } from "@/features/organizations/application/require-organization-member";
import { CurrentOrganization } from "@/features/organizations/components/current-organization";

type OrganizationDashboardPageProps = {
  params: Promise<{ organizationSlug: string }>;
};

export default async function OrganizationDashboardPage({
  params,
}: OrganizationDashboardPageProps) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationMember(organizationSlug);

  return (
    <main className="min-h-screen flex-1 bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <CurrentOrganization context={context} />
          <LogoutButton />
        </header>

        <section className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-8 text-center">
          <h2 className="text-lg font-semibold text-zinc-950">
            Dashboard em preparação
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-600">
            A organização ativa foi validada no servidor. Os módulos de
            gestão serão adicionados nas próximas etapas.
          </p>
        </section>

        {context.membership.role === "admin" ||
        context.membership.role === "coordinator" ? (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-950">Cadastros</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Configure os dados mestres usados pela organização.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href={`/app/${organizationSlug}/cadastros/veiculos`}
                className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                <span className="font-semibold text-zinc-950">Veículos</span>
                <span className="mt-1 block text-sm text-zinc-600">
                  Frota, capacidade e condição operacional.
                </span>
              </Link>
              <Link
                href={`/app/${organizationSlug}/cadastros/tecnicos`}
                className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                <span className="font-semibold text-zinc-950">Técnicos</span>
                <span className="mt-1 block text-sm text-zinc-600">
                  Profissionais, especialidades e aptidão para condução.
                </span>
              </Link>
              <Link
                href={`/app/${organizationSlug}/cadastros/clientes`}
                className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                <span className="font-semibold text-zinc-950">Clientes</span>
                <span className="mt-1 block text-sm text-zinc-600">
                  Empresas atendidas e suas unidades.
                </span>
              </Link>
              <Link
                href={`/app/${organizationSlug}/cadastros/especialidades`}
                className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                <span className="font-semibold text-zinc-950">
                  Especialidades
                </span>
                <span className="mt-1 block text-sm text-zinc-600">
                  Áreas de conhecimento técnico.
                </span>
              </Link>
              <Link
                href={`/app/${organizationSlug}/cadastros/tipos-atendimento`}
                className="rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 hover:bg-zinc-50"
              >
                <span className="font-semibold text-zinc-950">
                  Tipos de atendimento
                </span>
                <span className="mt-1 block text-sm text-zinc-600">
                  Categorias para os atendimentos futuros.
                </span>
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
