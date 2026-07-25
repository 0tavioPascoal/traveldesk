import { CircleCheck, CircleMinus } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function ActiveStatusBadge({
  active,
  feminine = false,
}: {
  active: boolean;
  feminine?: boolean;
}) {
  const Icon = active ? CircleCheck : CircleMinus;

  return (
    <Badge tone={active ? "success" : "neutral"} className="gap-1.5 whitespace-nowrap">
      <Icon aria-hidden="true" className="size-3" />
      {active ? (feminine ? "Ativa" : "Ativo") : feminine ? "Inativa" : "Inativo"}
    </Badge>
  );
}
