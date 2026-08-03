import type { ReactNode } from "react";

import { PageContainer } from "@/components/page/page-container";

export function ListPageShell({ children }: { children: ReactNode }) {
  return (
    <PageContainer className="flex min-h-full flex-1 flex-col gap-4">
      {children}
    </PageContainer>
  );
}

export function ListPageContent({ children }: { children: ReactNode }) {
  return <div className="flex-1">{children}</div>;
}

export function ListPageFooter({ children }: { children: ReactNode }) {
  return <footer className="mt-auto empty:hidden">{children}</footer>;
}
