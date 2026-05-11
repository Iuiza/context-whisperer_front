import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Play, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AgentFlowGraph } from "@/components/agent-flow-graph";
import { useProjectsStore } from "@/stores/projects-store";
import { ARTIFACT_META, type ArtifactType } from "@/lib/types";
import { mockTemplates, mockConstraints } from "@/lib/mock-data";

export const Route = createFileRoute("/projects/$id/orchestration")({
  component: OrchestrationPage,
});

function OrchestrationPage() {
  const { id } = Route.useParams();
  const project = useProjectsStore((s) => s.getProject(id));
  const advance = useProjectsStore((s) => s.advanceSimulation);
  const [openPrompt, setOpenPrompt] = useState<ArtifactType | null>(null);

  if (!project) throw notFound();

  const stateSnapshot = Object.fromEntries(
    project.selectedArtifacts.map((t) => {
      const a = project.artifacts.find((x) => x.type === t);
      return [ARTIFACT_META[t].file, a?.status ?? "NOT_STARTED"];
    }),
  );

  const template = openPrompt
    ? mockTemplates.find((t) => t.targetDocument === ARTIFACT_META[openPrompt].file)
    : null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Grafo de orquestração</CardTitle>
            <p className="text-xs text-muted-foreground">
              Coordenador → Drafters selecionados → Juiz → Resolvedor
            </p>
          </div>
          <Button size="sm" onClick={() => advance(project.id)} className="gap-2">
            <Play className="h-4 w-4" /> Avançar simulação
          </Button>
        </CardHeader>
        <CardContent>
          <AgentFlowGraph
            selected={project.selectedArtifacts}
            artifacts={project.artifacts}
            onShowPrompt={setOpenPrompt}
          />
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4" /> Estado global do grafo
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            global_state_snapshot (RNF03)
          </p>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
            {JSON.stringify(stateSnapshot, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Sheet open={!!openPrompt} onOpenChange={(o) => !o && setOpenPrompt(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              Prompt injetado — {openPrompt && ARTIFACT_META[openPrompt].label}
            </SheetTitle>
            <SheetDescription>
              RAG determinístico (RF05): template + constraints ativas.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4 px-4 pb-6">
            <div>
              <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                Template
              </div>
              <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-3 text-xs">
                {template?.contentMd ?? "—"}
              </pre>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                Constraints ativas
              </div>
              <ul className="space-y-2 text-sm">
                {mockConstraints
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <li key={c.id} className="rounded-md border border-border p-2">
                      <div className="text-xs text-primary">{c.category}</div>
                      <div className="font-medium">{c.ruleDescription}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.ruleContent}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
