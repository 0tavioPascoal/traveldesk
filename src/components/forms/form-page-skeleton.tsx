import { Skeleton } from "@/components/ui/skeleton";

export function FormPageSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div className="space-y-6" role="status" aria-label="Carregando formulário" aria-busy="true">
      <div className="space-y-3">
        <Skeleton className="h-4 w-56 max-w-full" />
        <Skeleton className="h-9 w-80 max-w-full" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      {Array.from({ length: sections }, (_, index) => (
        <div key={index} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
      ))}
      <Skeleton className="ml-auto h-[4.25rem] w-full rounded-2xl sm:w-72" />
      <span className="sr-only">Carregando formulário...</span>
    </div>
  );
}
