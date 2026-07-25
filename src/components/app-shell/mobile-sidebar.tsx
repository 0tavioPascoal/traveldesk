"use client";

import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { AppSidebar } from "@/components/app-shell/app-sidebar";
import type { OrganizationRole, UserOrganization } from "@/features/organizations/types/organization";

export function MobileSidebar({
  currentOrganization,
  role,
}: {
  currentOrganization: UserOrganization;
  role: OrganizationRole;
}) {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menu principal"
        onClick={() => dialogRef.current?.showModal()}
        className="grid size-11 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="mobile-navigation-title"
        className="m-0 h-dvh w-[min(20rem,88vw)] max-w-none overflow-hidden bg-sidebar p-0 text-sidebar-foreground shadow-2xl lg:hidden"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <h2 id="mobile-navigation-title" className="sr-only">Menu principal</h2>
        <button
          type="button"
          aria-label="Fechar menu principal"
          onClick={() => dialogRef.current?.close()}
          className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
        <AppSidebar currentOrganization={currentOrganization} role={role} onNavigate={() => dialogRef.current?.close()} />
      </dialog>
    </>
  );
}
