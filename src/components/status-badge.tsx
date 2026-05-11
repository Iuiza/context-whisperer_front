import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ArtifactStatus, ProjectStatus, ScopeStatus } from "@/lib/types";

type AnyStatus = ProjectStatus | ScopeStatus | ArtifactStatus;

const LABELS: Record<AnyStatus, string> = {
  AWAITING_SCOPE: "Aguardando escopo",
  GENERATING: "Gerando",
  COMPLETED: "Concluído",
  FAILED: "Com falhas",
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  DRAFT: "Rascunho",
  RUNNING: "Em execução",
  IDLE: "Aguardando",
};

const COLOR: Record<AnyStatus, string> = {
  AWAITING_SCOPE: "bg-status-pending/15 text-status-pending border-status-pending/30",
  GENERATING: "bg-status-running/15 text-status-running border-status-running/30",
  COMPLETED: "bg-status-approved/15 text-status-approved border-status-approved/30",
  FAILED: "bg-status-rejected/15 text-status-rejected border-status-rejected/30",
  PENDING: "bg-status-pending/15 text-status-pending border-status-pending/30",
  APPROVED: "bg-status-approved/15 text-status-approved border-status-approved/30",
  REJECTED: "bg-status-rejected/15 text-status-rejected border-status-rejected/30",
  DRAFT: "bg-muted text-muted-foreground border-border",
  RUNNING: "bg-status-running/15 text-status-running border-status-running/30",
  IDLE: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({
  status,
  className,
}: {
  status: AnyStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", COLOR[status], className)}
    >
      {LABELS[status]}
    </Badge>
  );
}
