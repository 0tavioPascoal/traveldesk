export function NoOrganizationsState() {
  return (
    <section className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-8 text-center">
      <h2 className="text-lg font-semibold text-zinc-950">
        Acesso ainda não configurado
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-600">
        Seu usuário ainda não possui um vínculo ativo com uma organização.
        Entre em contato com o responsável pelo acesso ao TravelDesk.
      </p>
    </section>
  );
}
