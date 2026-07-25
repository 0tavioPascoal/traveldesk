"use client";

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
    <nav
      aria-label="Recurso dos tipos de indisponibilidade"
      className="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted p-1 sm:w-fit"
      onKeyDown={(event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
        const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);
        if (currentIndex < 0) return;
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        links[(currentIndex + direction + links.length) % links.length]?.focus();
      }}
    >
      {(["technicians", "vehicles"] as const).map((item) => (
        <Link
          key={item}
          href={`${base}/${item === "technicians" ? "tecnicos" : "veiculos"}`}
          aria-current={resource === item ? "page" : undefined}
          className={resource === item
            ? "min-w-32 flex-1 rounded-lg bg-background px-4 py-2 text-center text-sm font-semibold text-foreground shadow-sm sm:flex-none"
            : "min-w-32 flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground sm:flex-none"}
        >
          {item === "technicians" ? "Técnicos" : "Veículos"}
        </Link>
      ))}
    </nav>
  );
}
