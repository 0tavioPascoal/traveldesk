import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton({ blocks = 2 }: { blocks?: number }) {
  return (
    <div aria-busy="true" aria-label="Carregando página" className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-[32rem] max-w-full" />
      </div>
      {Array.from({ length: blocks }, (_, index) => <Skeleton key={index} className="h-40" />)}
    </div>
  );
}
