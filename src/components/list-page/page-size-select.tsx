"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function PageSizeSelect({
  options,
  value,
}: {
  options: readonly number[];
  value: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="sr-only sm:not-sr-only">Itens por página</span>
      <select
        value={value}
        disabled={pending}
        aria-label="Itens por página"
        onChange={(event) => {
          const params = new URLSearchParams(searchParams);
          params.set("pageSize", event.target.value);
          params.delete("page");
          startTransition(() => router.push(`${pathname}?${params}`));
        }}
        className="h-10 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
