import { FormPageSkeleton } from "@/components/forms/form-page-skeleton";
import { FormPageContainer } from "@/components/page/page-container";

export default function NewTechnicianLoading() {
  return <FormPageContainer><FormPageSkeleton sections={5} /></FormPageContainer>;
}
