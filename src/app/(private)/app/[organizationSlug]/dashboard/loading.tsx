import { PageContainer } from "@/components/page/page-container";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <PageContainer className="max-w-7xl space-y-6"><div className="space-y-3"><Skeleton className="h-4 w-48" /><Skeleton className="h-9 w-56" /><Skeleton className="h-5 w-full max-w-2xl" /></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36" />)}</div><div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-96" /><Skeleton className="h-96" /></div><Skeleton className="h-52" /></PageContainer>;
}
