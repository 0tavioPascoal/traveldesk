import { PageContainer } from "@/components/page/page-container";
import { PageSkeleton } from "@/components/page/page-skeleton";

export default function ClientsLoading() {
  return <PageContainer><PageSkeleton blocks={3} /></PageContainer>;
}
