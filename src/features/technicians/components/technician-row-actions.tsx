import { CalendarOff, Pencil, UserRound, Wrench } from "lucide-react";
import Link from "next/link";

import {
  ListRowActions,
  listActionItemStyles,
} from "@/components/list-page/list-row-actions";
import { TechnicianStatusAction } from "@/features/technicians/components/technician-status-action";

export function TechnicianRowActions({
  organizationSlug,
  technicianId,
  technicianName,
  active,
}: {
  organizationSlug: string;
  technicianId: string;
  technicianName: string;
  active: boolean;
}) {
  const base = `/app/${organizationSlug}/cadastros/tecnicos/${technicianId}`;
  return (
    <ListRowActions
      label={`Abrir ações de ${technicianName}`}
      title="Ações do técnico"
      description={technicianName}
    >
      <Link href={base} className={listActionItemStyles}>
        <UserRound aria-hidden="true" className="size-4" />
        Visualizar
      </Link>
      <Link href={`${base}/editar`} className={listActionItemStyles}>
        <Pencil aria-hidden="true" className="size-4" />
        Editar
      </Link>
      <Link href={`${base}#especialidades`} className={listActionItemStyles}>
        <Wrench aria-hidden="true" className="size-4" />
        Especialidades
      </Link>
      {active ? (
        <Link
          href={`/app/${organizationSlug}/planejamento/indisponibilidades/tecnicos/nova?technicianId=${technicianId}`}
          className={listActionItemStyles}
        >
          <CalendarOff aria-hidden="true" className="size-4" />
          Registrar indisponibilidade
        </Link>
      ) : null}
      <div className="border-t border-border pt-2 [&>button]:w-full">
        <TechnicianStatusAction
          organizationSlug={organizationSlug}
          technicianId={technicianId}
          technicianName={technicianName}
          active={active}
        />
      </div>
    </ListRowActions>
  );
}
