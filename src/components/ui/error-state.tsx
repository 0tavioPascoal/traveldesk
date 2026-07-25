import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

export function ErrorState({
  title = "Não foi possível carregar esta página",
  description = "Tente novamente. Se o problema persistir, volte mais tarde.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <section role="alert" className="rounded-2xl border border-destructive/30 bg-card px-6 py-10 text-center">
      <CircleAlert aria-hidden="true" className="mx-auto size-8 text-destructive" />
      <h1 className="mt-4 text-lg font-semibold text-card-foreground">{title}</h1>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </section>
  );
}
