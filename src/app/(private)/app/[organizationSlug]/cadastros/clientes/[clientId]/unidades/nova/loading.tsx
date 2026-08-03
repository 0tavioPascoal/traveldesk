import { FormPageSkeleton } from "@/components/forms/form-page-skeleton";
import { FormPageContainer } from "@/components/page/page-container";

export default function NewClientUnitLoading() {
  return <FormPageContainer><FormPageSkeleton sections={4} /></FormPageContainer>;
}
