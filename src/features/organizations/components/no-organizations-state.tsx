export function NoOrganizationsState() {
  return (
    <section className="mt-6 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
      <h2 className="text-lg font-semibold text-card-foreground">
        Acesso ainda não configurado
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        Seu usuário ainda não possui um vínculo ativo com uma organização.
        Entre em contato com o responsável pelo acesso ao TravelDesk.
      </p>
    </section>
  );
}
