"use client";

import { ListPageShell } from "@/components/list-page/list-page-shell";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";

export function ListErrorState({
  title,
  retry,
}: {
  title: string;
  retry: () => void;
}) {
  return (
    <ListPageShell>
      <ErrorState
        title={title}
        description="Tente carregar os registros novamente. Nenhuma alteração foi realizada."
        action={
          <Button type="button" onClick={retry}>
            Tentar novamente
          </Button>
        }
      />
    </ListPageShell>
  );
}
