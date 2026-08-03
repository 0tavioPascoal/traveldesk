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
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <p aria-live="polite" className="text-sm text-muted-foreground" role="status">
        Abrindo sua organização...
      </p>
    </main>
  );
}
