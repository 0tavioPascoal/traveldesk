import { Building2, MapPin, Pencil } from "lucide-react";
import Link from "next/link";

import {
  DataTableShell,
  dataTableHeaderStyles,
  dataTableStyles,
} from "@/components/list-page/data-table-shell";
import {
  MobileRecordCard,
  MobileRecordList,
} from "@/components/list-page/mobile-record-list";
import {
  ListRowActions,
  listActionItemStyles,
} from "@/components/list-page/list-row-actions";
import { ActiveStatusBadge } from "@/components/ui/active-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { NoResultsState } from "@/components/ui/no-results-state";
import { ClientUnitStatusAction } from "@/features/clients/components/client-unit-status-action";
import type { ClientUnitListItem } from "@/features/clients/types/client";

function clientName(unit: ClientUnitListItem) {
  return unit.client.trade_name?.trim() || unit.client.legal_name;
}

function address(unit: ClientUnitListItem) {
  const street = [unit.address_line, unit.address_number]
    .filter(Boolean)
    .join(", ");
  const city = `${unit.city}/${unit.state}`;
  return [street, city].filter(Boolean).join(" · ");
}

export function ClientUnitOverviewList({
  organizationSlug,
  units,
  hasFilters,
}: {
  organizationSlug: string;
  units: ClientUnitListItem[];
  hasFilters: boolean;
}) {
  const clientListPath = `/app/${organizationSlug}/cadastros/clientes`;

  if (units.length === 0) {
    if (hasFilters) {
      return (
        <NoResultsState
          description="Revise os filtros ou limpe a pesquisa para encontrar outras unidades."
          action={{
            href: `/app/${organizationSlug}/cadastros/unidades`,
            label: "Limpar filtros",
          }}
        />
      );
    }

    return (
      <EmptyState
        icon={MapPin}
        title="Nenhuma unidade cadastrada"
        description="As unidades são vinculadas a clientes e aparecem aqui depois do cadastro."
        action={{ href: clientListPath, label: "Acessar clientes" }}
      />
    );
  }

  return (
    <>
      <DataTableShell>
        <table className={dataTableStyles}>
          <caption className="sr-only">
            Unidades cadastradas na organização
          </caption>
          <thead className={dataTableHeaderStyles}>
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">
                Unidade
              </th>
              <th data-list-column="units:client" scope="col" className="px-5 py-3 font-semibold">
                Cliente
              </th>
              <th data-list-column="units:location" scope="col" className="px-5 py-3 font-semibold">
                Localização
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Situação
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {units.map((unit) => {
              const clientPath = `${clientListPath}/${unit.client_id}`;

              return (
                <tr
                  key={unit.id}
                  className="transition-colors hover:bg-muted/45 focus-within:bg-muted/45"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-card-foreground">
                      {unit.name}
                    </p>
                    {unit.contact_name ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {unit.contact_name}
                      </p>
                    ) : null}
                  </td>
                  <td data-list-column="units:client" className="px-5 py-4">
                    <Link
                      href={clientPath}
                      className="font-medium text-foreground hover:text-primary hover:underline"
                    >
                      {clientName(unit)}
                    </Link>
                    {!unit.client.active ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Cliente inativo
                      </p>
                    ) : null}
                  </td>
                  <td data-list-column="units:location" className="px-5 py-4 text-muted-foreground">
                    {address(unit)}
                  </td>
                  <td className="px-5 py-4">
                    <ActiveStatusBadge active={unit.active} feminine />
                  </td>
                  <td className="px-5 py-4">
                    <ListRowActions label={`Abrir ações da unidade ${unit.name}`} title="Ações da unidade" description={unit.name}>
                      <Link href={clientPath} className={listActionItemStyles}><Building2 aria-hidden="true" className="size-4" />Abrir cliente</Link>
                      <Link
                        href={`${clientPath}/unidades/${unit.id}/editar`}
                        className={listActionItemStyles}
                      >
                        <Pencil aria-hidden="true" className="size-4" />
                        Editar
                      </Link>
                      <div className="[&>button]:min-h-11 [&>button]:w-full [&>button]:px-3 [&>button]:text-left [&>button:hover]:bg-muted"><ClientUnitStatusAction
                        key={`${unit.id}-${unit.active}`}
                        organizationSlug={organizationSlug}
                        clientId={unit.client_id}
                        unitId={unit.id}
                        active={unit.active}
                      /></div>
                    </ListRowActions>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableShell>

      <MobileRecordList label="Unidades cadastradas na organização">
        {units.map((unit) => {
          const clientPath = `${clientListPath}/${unit.client_id}`;

          return (
            <MobileRecordCard key={unit.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-semibold text-card-foreground">
                    {unit.name}
                  </h2>
                  <Link
                    data-list-column="units:client"
                    href={clientPath}
                    className="mt-1 block text-sm font-medium text-primary hover:underline"
                  >
                    {clientName(unit)}
                  </Link>
                </div>
                <ActiveStatusBadge active={unit.active} feminine />
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p data-list-column="units:location" className="flex gap-2">
                  <MapPin
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <span>{address(unit)}</span>
                </p>
                {unit.contact_name ? (
                  <p className="flex gap-2">
                    <Building2
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0"
                    />
                    <span>{unit.contact_name}</span>
                  </p>
                ) : null}
              </div>
              <div className="mt-4 flex justify-end border-t border-border pt-3">
                <ListRowActions label={`Abrir ações da unidade ${unit.name}`} title="Ações da unidade" description={unit.name}>
                  <Link href={clientPath} className={listActionItemStyles}><Building2 aria-hidden="true" className="size-4" />Abrir cliente</Link>
                  <Link href={`${clientPath}/unidades/${unit.id}/editar`} className={listActionItemStyles}><Pencil aria-hidden="true" className="size-4" />Editar</Link>
                  <div className="[&>button]:min-h-11 [&>button]:w-full [&>button]:px-3 [&>button]:text-left [&>button:hover]:bg-muted"><ClientUnitStatusAction key={`${unit.id}-${unit.active}`} organizationSlug={organizationSlug} clientId={unit.client_id} unitId={unit.id} active={unit.active} /></div>
                </ListRowActions>
              </div>
            </MobileRecordCard>
          );
        })}
      </MobileRecordList>
    </>
  );
}
