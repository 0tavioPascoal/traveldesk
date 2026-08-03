import {
  ListPageContent,
  ListPageFooter,
  ListPageShell,
} from "@/components/list-page/list-page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export function ListPageSkeleton({ hasTabs = false }: { hasTabs?: boolean }) {
  return (
    <ListPageShell>
      <div
        aria-busy="true"
        aria-label="Carregando listagem"
        className="flex min-h-full flex-1 flex-col gap-4"
      >
        <div className="space-y-3">
          <Skeleton className="h-4 w-48" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-[32rem] max-w-full" />
          </div>
        </div>
        {hasTabs ? <Skeleton className="h-11 w-80 max-w-full" /> : null}
        <Skeleton className="h-[6.5rem] rounded-xl md:h-14" />
        <ListPageContent>
          <div className="hidden overflow-hidden rounded-xl border border-border lg:block">
            <Skeleton className="h-12 rounded-none" />
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton
                key={index}
                className="h-16 rounded-none border-t border-border"
              />
            ))}
          </div>
          <div className="space-y-3 lg:hidden">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="space-y-4 rounded-xl border border-border p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        </ListPageContent>
        <ListPageFooter>
          <Skeleton className="h-16 rounded-xl" />
        </ListPageFooter>
      </div>
    </ListPageShell>
  );
}
