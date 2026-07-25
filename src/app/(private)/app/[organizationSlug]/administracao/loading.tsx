import { PageContainer } from "@/components/page/page-container";
import { PageSkeleton } from "@/components/page/page-skeleton";

export default function Loading() {
  return <PageContainer className="max-w-6xl"><PageSkeleton blocks={3} /></PageContainer>;
}
