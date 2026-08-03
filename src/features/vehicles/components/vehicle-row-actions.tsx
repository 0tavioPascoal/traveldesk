import { CalendarOff, Eye, Pencil } from "lucide-react";
import Link from "next/link";

import {
  ListRowActions,
  listActionItemStyles,
} from "@/components/list-page/list-row-actions";
import { VehicleActiveStateAction } from "@/features/vehicles/components/vehicle-active-state-action";
import { VehicleStatusAction } from "@/features/vehicles/components/vehicle-status-action";
import type { VehicleOperationalStatus } from "@/features/vehicles/types/vehicle";

export function VehicleRowActions({
  organizationSlug,
  vehicleId,
  plate,
  active,
  operationalStatus,
}: {
  organizationSlug: string;
  vehicleId: string;
  plate: string;
  active: boolean;
  operationalStatus: VehicleOperationalStatus;
}) {
  const base = `/app/${organizationSlug}/cadastros/veiculos/${vehicleId}`;
  return (
    <ListRowActions
      label={`Abrir ações do veículo ${plate}`}
      title="Ações do veículo"
      description={plate}
    >
      <Link href={base} className={listActionItemStyles}>
        <Eye aria-hidden="true" className="size-4" />
        Visualizar
      </Link>
      <Link href={`${base}/editar`} className={listActionItemStyles}>
        <Pencil aria-hidden="true" className="size-4" />
        Editar
      </Link>
      {active ? (
        <Link
          href={`/app/${organizationSlug}/planejamento/indisponibilidades/veiculos/nova?vehicleId=${vehicleId}`}
          className={listActionItemStyles}
        >
          <CalendarOff aria-hidden="true" className="size-4" />
          Registrar indisponibilidade
        </Link>
      ) : null}
      <div className="flex flex-col gap-2 border-t border-border pt-3 [&>button]:w-full">
        <VehicleStatusAction
          organizationSlug={organizationSlug}
          vehicleId={vehicleId}
          currentStatus={operationalStatus}
          vehicleLabel={plate}
        />
        <VehicleActiveStateAction
          organizationSlug={organizationSlug}
          vehicleId={vehicleId}
          vehicleLabel={plate}
          active={active}
        />
      </div>
    </ListRowActions>
  );
}
