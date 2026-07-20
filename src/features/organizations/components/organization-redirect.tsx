"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type OrganizationRedirectProps = {
  organizationSlug: string;
};

export function OrganizationRedirect({
  organizationSlug,
}: OrganizationRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(
      `/app/${encodeURIComponent(organizationSlug)}/dashboard`,
    );
  }, [organizationSlug, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <p aria-live="polite" className="text-sm text-zinc-600" role="status">
        Abrindo sua organização...
      </p>
    </main>
  );
}
