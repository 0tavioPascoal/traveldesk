"use client";

import { LogOut } from "lucide-react";
import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";

import {
  logoutAction,
  type LogoutActionState,
} from "@/features/auth/actions/logout-action";

function LogoutSubmitButton({ variant }: { variant: "button" | "menu" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        variant === "menu"
          ? "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
          : "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium text-card-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-60"
      }
    >
      <LogOut aria-hidden="true" className="size-4" />
      {pending ? "Saindo..." : "Sair"}
    </button>
  );
}

const initialState: LogoutActionState = { error: null };

export function LogoutButton({
  variant = "button",
}: {
  variant?: "button" | "menu";
}) {
  const [state, formAction] = useActionState(logoutAction, initialState);
  const errorId = useId();

  return (
    <form action={formAction}>
      <LogoutSubmitButton variant={variant} />
      {state.error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-2 text-xs font-medium text-destructive"
        >
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
