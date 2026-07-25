import { PageContainer } from "@/components/page/page-container";
import { ErrorState } from "@/components/ui/error-state";

export default function NotFound() { return <PageContainer className="max-w-3xl"><ErrorState title="Registro não encontrado ou indisponível." description="A especialidade não está disponível nesta organização." /></PageContainer>; }
