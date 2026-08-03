"use client";

import { useSyncExternalStore } from "react";

function subscribeToHashChange(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getCurrentHash() {
  return window.location.hash;
}

export function AdministrationNavigation() {
  const currentHash = useSyncExternalStore(
    subscribeToHashChange,
    getCurrentHash,
    () => "",
  );
  const organizationActive =
    currentHash === "" || currentHash === "#organizacao";
  const membersActive = currentHash === "#membros";
  const itemStyles =
    "min-h-10 rounded-lg px-4 py-2 text-center text-sm font-semibold transition-colors";

  return (
    <nav aria-label="Seções da administração" className="flex w-full gap-1 overflow-x-auto rounded-xl border border-border bg-muted p-1 sm:w-fit">
      <a
        href="#organizacao"
        aria-current={organizationActive ? "location" : undefined}
        className={`${itemStyles} min-w-32 ${
          organizationActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
        }`}
      >
        Organização
      </a>
      <a
        href="#membros"
        aria-current={membersActive ? "location" : undefined}
        className={`${itemStyles} min-w-40 ${
          membersActive
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
        }`}
      >
        Membros e acessos
      </a>
    </nav>
  );
}
