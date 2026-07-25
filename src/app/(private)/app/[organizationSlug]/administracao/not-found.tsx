import { PageContainer } from "@/components/page/page-container";
import { ErrorState } from "@/components/ui/error-state";

export default function NotFound() {
  return <PageContainer className="max-w-3xl"><ErrorState title="Organização não encontrada ou indisponível." description="Não foi possível acessar os dados administrativos desta organização." /></PageContainer>;
}
