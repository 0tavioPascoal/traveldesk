import { PageContainer } from "@/components/page/page-container";
import { ErrorState } from "@/components/ui/error-state";

export default function TechnicianUnavailabilityNotFound() { return <PageContainer><ErrorState title="Indisponibilidade não encontrada ou indisponível." description="Verifique o endereço ou volte à listagem de indisponibilidades." /></PageContainer>; }
