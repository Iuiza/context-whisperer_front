"use client";
import { useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { Check, X, MessageSquareWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownView } from "@/components/markdown-view";
import { StatusBadge } from "@/components/status-badge";
import { useProjectsStore } from "@/stores/projects-store";

export default function ScopePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const project = useProjectsStore((s) => s.getProject(id));
  const setScopeStatus = useProjectsStore((s) => s.setScopeStatus);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");

  if (!project) notFound();

  const approve = () => {
    setScopeStatus(project.id, "APPROVED");
    router.push(`/projects/${project.id}/orchestration`);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Prompt original
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm whitespace-pre-wrap text-foreground/90">
          {project.prompt}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Proposta de escopo</CardTitle>
            <p className="text-xs text-muted-foreground">Validação Human-in-the-Loop (RF03)</p>
          </div>
          <StatusBadge status={project.scope.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border border-border bg-muted/30 p-4">
            <MarkdownView content={project.scope.contentMd} />
          </div>

          {project.scope.feedback && (
            <div className="rounded-md border border-status-pending/40 bg-status-pending/10 p-3 text-sm">
              <div className="mb-1 text-xs font-medium text-status-pending">
                Feedback enviado ao agente
              </div>
              <p className="text-foreground/90">{project.scope.feedback}</p>
            </div>
          )}

          {showFeedback && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Solicitar ajustes na proposta</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder="Ex.: incluir suporte a múltiplos endereços por usuário…"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowFeedback(false)}>
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setScopeStatus(project.id, "PENDING", feedback);
                    setShowFeedback(false);
                    setFeedback("");
                  }}
                  disabled={!feedback.trim()}
                >
                  Reenviar para o agente
                </Button>
              </div>
            </div>
          )}

          {project.scope.status !== "APPROVED" && (
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                variant="outline"
                onClick={() => setScopeStatus(project.id, "REJECTED")}
                className="gap-2"
              >
                <X className="h-4 w-4" /> Rejeitar
              </Button>
              <Button variant="outline" onClick={() => setShowFeedback(true)} className="gap-2">
                <MessageSquareWarning className="h-4 w-4" /> Solicitar ajustes
              </Button>
              <Button onClick={approve} className="gap-2">
                <Check className="h-4 w-4" /> Aprovar escopo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
