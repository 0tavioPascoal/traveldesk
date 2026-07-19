import Link from "next/link";
import { notFound } from "next/navigation";

import { ServiceTypeForm } from "@/features/service-types/components/service-type-form";
import { getServiceTypeById } from "@/features/service-types/queries/get-service-type-by-id";

type EditServiceTypePageProps = {
  params: Promise<{ organizationSlug: string; serviceTypeId: string }>;
};

export default async function EditServiceTypePage({
  params,
}: EditServiceTypePageProps) {
  const { organizationSlug, serviceTypeId } = await params;
  const serviceType = await getServiceTypeById(
    organizationSlug,
    serviceTypeId,
  );

  if (!serviceType) {
    notFound();
  }

  const listPath = `/app/${organizationSlug}/cadastros/tipos-atendimento`;

  return (
    <main className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <Link
            href={listPath}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
          >
            ← Voltar para tipos de atendimento
          </Link>
          <h1 className="mt-5 text-2xl font-bold text-zinc-950">
            Editar tipo de atendimento
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Atualize os dados e a disponibilidade deste cadastro.
          </p>
        </header>
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <ServiceTypeForm
            organizationSlug={organizationSlug}
            serviceTypeId={serviceType.id}
            initialValues={{
              name: serviceType.name,
              description: serviceType.description ?? "",
              active: serviceType.active,
            }}
          />
        </section>
      </div>
    </main>
  );
}
