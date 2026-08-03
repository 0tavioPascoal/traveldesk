"use client";

import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import {
  organizationRoleLabels,
  type OrganizationRole,
  type UserOrganization,
} from "@/features/organizations/types/organization";

function getInitials(name: string, email: string) {
  const source = name.trim() || email.trim();
  const words = source
    .replace(/@.*$/, "")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "U";

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toLocaleUpperCase("pt-BR"))
    .join("");
}

export function UserMenu({
  currentOrganization,
  profile,
  role,
}: {
  currentOrganization: UserOrganization;
  profile: { name: string; email: string };
  role: OrganizationRole;
}) {
  const pathname = usePathname();
  const menuId = useId();
  const [menuState, setMenuState] = useState({ open: false, pathname });
  const open = menuState.pathname === pathname && menuState.open;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const displayName = profile.name.trim() || profile.email.trim() || "Usuário";
  const roleLabel = organizationRoleLabels[role];
  const avatar = getInitials(profile.name, profile.email);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setMenuState({ open: false, pathname });
      }
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
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Abrir menu de ${displayName}, ${roleLabel}`}
        title={`${displayName} · ${roleLabel}`}
        onClick={() => setMenuState({ open: !open, pathname })}
        className="flex h-11 min-w-11 max-w-64 items-center justify-center gap-2 rounded-xl px-1 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:justify-start xl:px-2"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {avatar}
        </span>
        <span className="hidden min-w-0 flex-1 xl:block">
          <span className="block truncate text-sm font-semibold">
            {displayName}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {roleLabel}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`hidden size-4 shrink-0 text-muted-foreground transition-transform xl:block ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="dialog"
          aria-label="Dados e ações do usuário"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(19rem,calc(100vw-2rem))] rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-lg"
        >
          <div className="flex items-start gap-3 px-2 pb-3 pt-2">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {avatar}
            </span>
            <div className="min-w-0">
              <p className="break-words text-sm font-semibold">{displayName}</p>
              {profile.email ? (
                <p className="break-all text-xs text-muted-foreground">
                  {profile.email}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {roleLabel} · {currentOrganization.name}
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <div>
              <LogoutButton variant="menu" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
