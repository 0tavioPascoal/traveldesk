import { PageContainer } from "@/components/page/page-container";
import { Skeleton } from "@/components/ui/skeleton";
import { TripFormSkeleton } from "@/features/trips/components/trip-form-skeleton";

export default function EditTripLoading() {
  return (
    <PageContainer className="space-y-6">
      <div className="space-y-3"><Skeleton className="h-4 w-64" /><Skeleton className="h-3 w-36" /><Skeleton className="h-8 w-56" /><Skeleton className="h-4 w-[38rem] max-w-full" /></div>
      <div className="mx-auto w-full max-w-6xl"><TripFormSkeleton /></div>
    </PageContainer>
  );
}
