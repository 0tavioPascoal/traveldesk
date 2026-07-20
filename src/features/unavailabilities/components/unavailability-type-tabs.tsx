import Link from "next/link";

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
    <nav aria-label="Categoria do tipo" className="flex gap-2 rounded-xl border border-zinc-200 bg-white p-2">
      {(["technicians", "vehicles"] as const).map((item) => (
        <Link
          key={item}
          href={`${base}/${item === "technicians" ? "tecnicos" : "veiculos"}`}
          aria-current={resource === item ? "page" : undefined}
          className={resource === item
            ? "rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white"
            : "rounded-lg px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"}
        >
          {item === "technicians" ? "Técnicos" : "Veículos"}
        </Link>
      ))}
    </nav>
  );
}
