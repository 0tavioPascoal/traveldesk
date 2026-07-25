import { PageContainer } from "@/components/page/page-container";
import { UnavailabilityFormSkeleton } from "@/features/unavailabilities/components/unavailability-form-skeleton";

export default function LoadingNewTechnicianUnavailability() { return <PageContainer className="max-w-5xl"><UnavailabilityFormSkeleton /></PageContainer>; }
