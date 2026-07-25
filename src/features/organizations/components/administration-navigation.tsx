export function AdministrationNavigation() {
  return (
    <nav aria-label="Seções da administração" className="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted p-1 sm:w-fit">
      <a href="#organizacao" className="min-w-32 rounded-lg bg-background px-4 py-2 text-center text-sm font-semibold text-foreground shadow-sm">Organização</a>
      <a href="#membros" className="min-w-40 rounded-lg px-4 py-2 text-center text-sm font-semibold text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground">Membros e acessos</a>
    </nav>
  );
}
