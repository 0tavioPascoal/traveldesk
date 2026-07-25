"use client";

import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { organizationRoleLabels, type OrganizationRole } from "@/features/organizations/types/organization";

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

export function UserMenu({ profile, role }: { profile: { name: string; email: string }; role: OrganizationRole }) {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState({ open: false, pathname });
  const open = menuState.pathname === pathname && menuState.open;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setMenuState({ open: false, pathname });
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuState({ open: false, pathname });
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, pathname]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setMenuState({ open: !open, pathname })}
        className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-left hover:bg-muted"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
          {initials(profile.name) || "U"}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-40 truncate text-sm font-semibold text-foreground">{profile.name}</span>
          <span className="block text-xs text-muted-foreground">{organizationRoleLabels[role]}</span>
        </span>
        <ChevronDown aria-hidden="true" className="hidden size-4 text-muted-foreground sm:block" />
      </button>
      {open ? (
        <div role="dialog" aria-label="Dados e ações do usuário" className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-xl border border-border bg-popover p-3 text-popover-foreground shadow-lg">
          <div className="border-b border-border px-1 pb-3">
            <p className="truncate text-sm font-semibold">{profile.name}</p>
            <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">{organizationRoleLabels[role]}</p>
          </div>
          <div className="pt-3 [&_button]:w-full [&_button]:border-0 [&_button]:bg-transparent [&_button]:text-destructive [&_button:hover]:bg-destructive/10">
            <LogoutButton />
          </div>
        </div>
      ) : null}
    </div>
  );
}
