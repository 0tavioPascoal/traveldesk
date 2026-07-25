import { Badge } from "@/components/ui/badge";
import { InlineAlert } from "@/components/ui/inline-alert";
import type { TripSkillCoverage } from "@/features/trips/types/trip-staffing";

export function TripSkillCoverage({ coverage }: { coverage: TripSkillCoverage }) {
  if (coverage.totalCount === 0) {
    return <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">Nenhum requisito técnico definido.</p>;
  }
  return (
    <div className="space-y-4">
      <InlineAlert tone={coverage.complete ? "success" : "warning"}>{coverage.complete ? "Cobertura completa" : "Cobertura incompleta"}: {coverage.coveredCount} de {coverage.totalCount} requisitos atendidos.</InlineAlert>
      <ul className="space-y-2">
        {coverage.requirements.map((item) => (
          <li key={item.id} className="rounded-lg border border-border p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{item.skillName} · nível mínimo {item.minimumProficiencyLevel}</span>
              <Badge tone={item.covered ? "success" : "danger"}>{item.covered ? "Atendido" : "Não atendido"}</Badge>
            </div>
            {item.coveredBy.length ? <p className="mt-1 text-muted-foreground">Por {item.coveredBy.map((technician) => technician.technicianName).join(", ")}</p> : null}
            {!item.skillActive ? <p className="mt-1 text-warning">Especialidade atualmente inativa.</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
