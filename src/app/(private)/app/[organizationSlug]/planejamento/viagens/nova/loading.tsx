import { FormPageContainer } from "@/components/page/page-container";
import { TripFormSkeleton } from "@/features/trips/components/trip-form-skeleton";

export default function NewTripLoading() {
  return (
    <FormPageContainer>
      <TripFormSkeleton />
    </FormPageContainer>
  );
}
