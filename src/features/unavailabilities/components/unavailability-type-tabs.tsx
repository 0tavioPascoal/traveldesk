import { ListTabs } from "@/components/list-page/list-tabs";

import type { UnavailabilityResourceKind } from "@/features/unavailabilities/types/unavailability";

export function UnavailabilityTypeTabs({
  organizationSlug,
  resource,
}: {
  organizationSlug: string;
  resource?: UnavailabilityResourceKind;
}) {
  const base = `/app/${organizationSlug}/cadastros/tipos-indisponibilidade`;
  return (
    <ListTabs
      label="Recurso dos tipos de indisponibilidade"
      items={[
        {
          href: `${base}/tecnicos`,
          label: "Técnicos",
          active: resource === "technicians",
        },
        {
          href: `${base}/veiculos`,
          label: "Veículos",
          active: resource === "vehicles",
        },
      ]}
    />
  );
}
