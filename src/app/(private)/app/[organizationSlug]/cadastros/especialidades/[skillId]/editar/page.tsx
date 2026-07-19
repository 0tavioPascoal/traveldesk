import Link from "next/link";
import { notFound } from "next/navigation";

import { SkillForm } from "@/features/skills/components/skill-form";
import { getSkillById } from "@/features/skills/queries/get-skill-by-id";

type EditSkillPageProps = {
  params: Promise<{ organizationSlug: string; skillId: string }>;
};

export default async function EditSkillPage({ params }: EditSkillPageProps) {
  const { organizationSlug, skillId } = await params;
  const skill = await getSkillById(organizationSlug, skillId);

  if (!skill) {
    notFound();
  }

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
          <h1 className="mt-5 text-2xl font-bold text-zinc-950">
            Editar especialidade
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Atualize os dados e a disponibilidade deste cadastro.
          </p>
        </header>
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <SkillForm
            organizationSlug={organizationSlug}
            skillId={skill.id}
            initialValues={{
              name: skill.name,
              description: skill.description ?? "",
              active: skill.active,
            }}
          />
        </section>
      </div>
    </main>
  );
}
