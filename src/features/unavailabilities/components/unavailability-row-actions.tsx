import { ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";

import {
  ListRowActions,
  listActionItemStyles,
} from "@/components/list-page/list-row-actions";
import { UnavailabilityStatusAction } from "@/features/unavailabilities/components/unavailability-status-action";
import type { UnavailabilityResourceKind } from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityRowActions({
  organizationSlug,
  resource,
  unavailabilityId,
  resourceId,
  resourceName,
  active,
  canEdit,
}: {
  organizationSlug: string;
  resource: UnavailabilityResourceKind;
  unavailabilityId: string;
  resourceId: string;
  resourceName: string;
  active: boolean;
  canEdit: boolean;
}) {
  const segment = resource === "technicians" ? "tecnicos" : "veiculos";
  const editPath = `/app/${organizationSlug}/planejamento/indisponibilidades/${segment}/${unavailabilityId}/editar`;
  const resourcePath = `/app/${organizationSlug}/cadastros/${segment}/${resourceId}`;
  return (
    <ListRowActions
      label={`Abrir ações da indisponibilidade de ${resourceName}`}
      title="Ações da indisponibilidade"
      description={resourceName}
    >
      {canEdit ? (
        <Link href={editPath} className={listActionItemStyles}>
          <Pencil aria-hidden="true" className="size-4" />
          Editar período
        </Link>
      ) : null}
      <Link href={resourcePath} className={listActionItemStyles}>
        <ExternalLink aria-hidden="true" className="size-4" />
        Abrir {resource === "technicians" ? "técnico" : "veículo"}
      </Link>
      <div className="border-t border-border pt-3 [&>button]:w-full">
        <UnavailabilityStatusAction
          organizationSlug={organizationSlug}
          resource={resource}
          id={unavailabilityId}
          active={active}
          resourceName={resourceName}
        />
      </div>
    </ListRowActions>
  );
}
