import Link from "next/link";

import { PageContainer } from "@/components/page/page-container";
import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function VehicleNotFound() { return <PageContainer><EmptyState title="Veículo não encontrado ou indisponível" description="O registro não existe ou não está disponível para esta organização." /><div className="mt-4 flex justify-center"><Link href="../" className={buttonStyles({ variant: "secondary" })}>Voltar à listagem</Link></div></PageContainer>; }
