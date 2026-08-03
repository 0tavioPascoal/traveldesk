"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

export function RefreshListButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      aria-busy={pending}
      onClick={() => startTransition(() => router.refresh())}
    >
      <RefreshCw
        aria-hidden="true"
        className={`size-4 ${pending ? "animate-spin" : ""}`}
      />
      <span className="hidden sm:inline">
        {pending ? "Atualizando..." : "Atualizar"}
      </span>
      <span className="sr-only sm:hidden">
        {pending ? "Atualizando listagem" : "Atualizar listagem"}
      </span>
    </Button>
  );
}
