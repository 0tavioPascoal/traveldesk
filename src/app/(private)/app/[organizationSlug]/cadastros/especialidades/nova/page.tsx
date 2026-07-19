import Link from "next/link";

import { requireOrganizationRole } from "@/features/organizations/application/require-organization-role";
import { SkillForm } from "@/features/skills/components/skill-form";

type NewSkillPageProps = {
  params: Promise<{ organizationSlug: string }>;
};

const administrativeRoles = ["admin", "coordinator"] as const;

export default async function NewSkillPage({ params }: NewSkillPageProps) {
  const { organizationSlug } = await params;
  const context = await requireOrganizationRole(
    organizationSlug,
    administrativeRoles,
  );
  const listPath = `/app/${organizationSlug}/cadastros/especialidades`;

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <Link
            href={listPath}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
          >
            ← Voltar para especialidades
          </Link>
          <p className="mt-5 text-sm font-medium text-zinc-500">
            {context.organization.name}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-zinc-950">
            Nova especialidade
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Cadastre uma especialidade técnica para esta organização.
          </p>
        </header>
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <SkillForm
            organizationSlug={organizationSlug}
            initialValues={{ name: "", description: "", active: true }}
          />
        </section>
      </div>
    </main>
  );
}
