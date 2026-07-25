import { Badge } from "@/components/ui/badge";

type SemanticTone = "neutral" | "primary" | "info" | "success" | "warning" | "danger";

export function StatusBadge({ label, tone = "neutral" }: { label: string; tone?: SemanticTone }) {
  return <Badge tone={tone}>{label}</Badge>;
}

export function PriorityBadge({ label, tone = "neutral" }: { label: string; tone?: SemanticTone }) {
  return <Badge tone={tone}>{label}</Badge>;
}
