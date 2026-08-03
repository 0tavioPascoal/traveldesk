import { Eye, Pencil } from "lucide-react";
import Link from "next/link";

import {
  ListRowActions,
  listActionItemStyles,
} from "@/components/list-page/list-row-actions";
import type { TripStatus } from "@/features/trips/types/trip";

export function TripRowActions({
  basePath,
  tripId,
  code,
  status,
}: {
  basePath: string;
  tripId: string;
  code: string;
  status: TripStatus;
}) {
  const editable = status === "draft" || status === "planned";

  return (
    <ListRowActions
      label={`Abrir ações da viagem ${code}`}
      title="Ações da viagem"
      description={code}
    >
            <Link href={`${basePath}/${tripId}`} className={listActionItemStyles}>
              <Eye aria-hidden="true" className="size-4" />Visualizar
            </Link>
            {editable ? (
              <Link href={`${basePath}/${tripId}/editar`} className={listActionItemStyles}>
                <Pencil aria-hidden="true" className="size-4" />Editar
              </Link>
            ) : null}
          {!editable ? <p className="px-3 py-2 text-xs leading-5 text-muted-foreground">Outras ações operacionais estão disponíveis nos detalhes da viagem.</p> : null}
    </ListRowActions>
  );
}
