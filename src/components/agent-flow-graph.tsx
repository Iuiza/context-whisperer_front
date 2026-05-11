import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { ARTIFACT_META, type Artifact, type ArtifactType } from "@/lib/types";

interface FlowGraphProps {
  selected: ArtifactType[];
  artifacts: Artifact[];
  onShowPrompt?: (type: ArtifactType) => void;
}

function AgentNode({
  title,
  subtitle,
  status,
  iterations,
  onShowPrompt,
  tone = "default",
}: {
  title: string;
  subtitle?: string;
  status?: Artifact["status"];
  iterations?: number;
  onShowPrompt?: () => void;
  tone?: "default" | "primary" | "warn" | "success";
}) {
  const toneClass =
    tone === "primary"
      ? "border-primary/40"
      : tone === "warn"
        ? "border-status-pending/40"
        : tone === "success"
          ? "border-status-approved/40"
          : "border-border";
  return (
    <Card className={`min-w-[180px] gap-2 border ${toneClass} bg-card p-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-semibold leading-tight">{title}</div>
        {status && <StatusBadge status={status} className="text-[10px]" />}
      </div>
      {subtitle && (
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      )}
      {typeof iterations === "number" && (
        <Badge variant="secondary" className="w-fit text-[10px]">
          iter. {iterations}
        </Badge>
      )}
      {onShowPrompt && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 justify-start px-1 text-xs text-primary"
          onClick={onShowPrompt}
        >
          Ver prompt injetado
        </Button>
      )}
    </Card>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center text-muted-foreground">
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}

export function AgentFlowGraph({ selected, artifacts, onShowPrompt }: FlowGraphProps) {
  const drafters = selected.map((t) => {
    const a = artifacts.find((x) => x.type === t);
    return {
      type: t,
      label: ARTIFACT_META[t].label,
      file: ARTIFACT_META[t].file,
      status: a?.status ?? "IDLE",
      iter: a?.iterationCount ?? 0,
    };
  });

  return (
    <div className="space-y-6 overflow-x-auto pb-2">
      {/* Phase 1 */}
      <div className="flex items-center gap-3">
        <AgentNode title="🎯 Analisador de Escopo" subtitle="Fase 1 — Negócio" tone="primary" />
        <Arrow />
        <AgentNode title="👤 Aprovação Humana (HITL)" subtitle="Validação" tone="warn" />
        <Arrow />
        <AgentNode title="🧭 Coordenador (Tech Lead)" subtitle="Fase 2 — Distribui" tone="primary" />
      </div>

      {/* Phase 2: Drafters */}
      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Geração especializada
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {drafters.map((d) => (
            <AgentNode
              key={d.type}
              title={`✍️ ${d.label}`}
              subtitle={d.file}
              status={d.status}
              iterations={d.iter}
              onShowPrompt={onShowPrompt ? () => onShowPrompt(d.type) : undefined}
            />
          ))}
        </div>
      </div>

      {/* Phase 3 */}
      <div className="flex items-center gap-3">
        <AgentNode title="⚖️ Juiz Restritivo" subtitle="LLM-as-a-Judge" />
        <Arrow />
        <AgentNode title="🛠️ Resolvedor" subtitle="Delega correção" />
        <Arrow />
        <AgentNode title="⚙️ Gerador agents.md" subtitle="Fase 4 — Final" tone="success" />
      </div>
    </div>
  );
}
