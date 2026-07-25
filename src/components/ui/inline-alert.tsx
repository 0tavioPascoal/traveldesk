import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

const config = {
  info: { icon: Info, styles: "border-info/30 bg-info/10 text-info" },
  success: { icon: CheckCircle2, styles: "border-success/30 bg-success/10 text-success" },
  warning: { icon: TriangleAlert, styles: "border-warning/30 bg-warning/10 text-warning" },
  error: { icon: AlertCircle, styles: "border-destructive/30 bg-destructive/10 text-destructive" },
} as const;

export function InlineAlert({ children, tone = "info", role }: { children: ReactNode; tone?: keyof typeof config; role?: "alert" | "status" }) {
  const Icon = config[tone].icon;
  return <div role={role ?? (tone === "error" ? "alert" : "status")} className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${config[tone].styles}`}><Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><div>{children}</div></div>;
}
