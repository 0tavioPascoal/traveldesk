import { FormPageSkeleton } from "@/components/forms/form-page-skeleton";
import { FormPageContainer } from "@/components/page/page-container";

export default function NewClientLoading() {
  return <FormPageContainer><FormPageSkeleton sections={2} /></FormPageContainer>;
}
