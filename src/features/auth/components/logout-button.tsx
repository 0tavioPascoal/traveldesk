"use client";

import { useFormStatus } from "react-dom";

import { logoutAction } from "@/features/auth/actions/logout-action";

function LogoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-medium text-card-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Saindo..." : "Sair"}
    </button>
  );
}

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <LogoutSubmitButton />
    </form>
  );
}
