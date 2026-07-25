import { SearchX } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";

export function NoResultsState({
  description = "Altere ou limpe os filtros para ampliar os resultados.",
  action,
}: {
  description?: string;
  action?: { href: string; label: string };
}) {
  return <EmptyState icon={SearchX} title="Nenhum resultado encontrado" description={description} action={action} />;
}
