import { useMemo, useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjectsStore } from "@/stores/projects-store";
import { ARTIFACT_META, type ArtifactType } from "@/lib/types";

export const Route = createFileRoute("/projects/$id/evaluation")({
  component: EvaluationPage,
});

function EvaluationPage() {
  const { id } = Route.useParams();
  const project = useProjectsStore((s) => s.getProject(id));
  const [artifactFilter, setArtifactFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);

  if (!project) throw notFound();

  const logs = useMemo(
    () =>
      project.evaluations.filter((e) => {
        if (
          artifactFilter !== "ALL" &&
          e.artifactType !== (artifactFilter as ArtifactType)
        )
          return false;
        if (statusFilter === "APPROVED" && !e.isApproved) return false;
        if (statusFilter === "REJECTED" && e.isApproved) return false;
        return true;
      }),
    [project.evaluations, artifactFilter, statusFilter],
  );

  const approvedCount = project.artifacts.filter((a) => a.status === "APPROVED").length;
  const totalCount = project.selectedArtifacts.length;

  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <div className="text-sm text-muted-foreground">Status global</div>
            <div className="text-lg font-semibold">
              {approvedCount} de {totalCount} artefatos aprovados
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-primary/40 text-primary"
          >
            {project.evaluations.length} avaliações registradas
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Logs de avaliação do Juiz</CardTitle>
            <p className="text-xs text-muted-foreground">
              EVALUATION_LOGS — feedback causal e snapshot do estado global.
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={artifactFilter} onValueChange={setArtifactFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Artefato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os artefatos</SelectItem>
                {project.selectedArtifacts.map((t) => (
                  <SelectItem key={t} value={t}>
                    {ARTIFACT_META[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="APPROVED">Aprovados</SelectItem>
                <SelectItem value="REJECTED">Reprovados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhuma avaliação ainda. Avance a orquestração para gerar artefatos
              e acionar o Juiz.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artefato</TableHead>
                  <TableHead>Iter.</TableHead>
                  <TableHead>Constraint</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Feedback causal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <Collapsible
                    key={log.id}
                    asChild
                    open={openId === log.id}
                    onOpenChange={(o) => setOpenId(o ? log.id : null)}
                  >
                    <>
                      <CollapsibleTrigger asChild>
                        <TableRow className="cursor-pointer">
                          <TableCell className="font-medium">
                            {ARTIFACT_META[log.artifactType].label}
                          </TableCell>
                          <TableCell>{log.iteration}</TableCell>
                          <TableCell>
                            <div className="text-xs text-muted-foreground">
                              {log.constraintCategory}
                            </div>
                            <div className="text-sm">{log.constraintRule}</div>
                          </TableCell>
                          <TableCell>
                            {log.isApproved ? (
                              <Badge className="gap-1 bg-status-approved/15 text-status-approved hover:bg-status-approved/20">
                                <Check className="h-3 w-3" /> Aprovado
                              </Badge>
                            ) : (
                              <Badge className="gap-1 bg-status-rejected/15 text-status-rejected hover:bg-status-rejected/20">
                                <X className="h-3 w-3" /> Reprovado
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="max-w-md text-sm text-muted-foreground">
                            {log.causalFeedback}
                          </TableCell>
                        </TableRow>
                      </CollapsibleTrigger>
                      <CollapsibleContent asChild>
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/20">
                            <div className="grid gap-3 py-3 lg:grid-cols-3">
                              <div>
                                <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                                  Judge prompt
                                </div>
                                <pre className="overflow-x-auto rounded-md border border-border bg-background p-2 text-xs">
                                  {log.judgePrompt}
                                </pre>
                              </div>
                              <div>
                                <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                                  Resposta bruta
                                </div>
                                <pre className="overflow-x-auto rounded-md border border-border bg-background p-2 text-xs">
                                  {log.rawJudgeResponse}
                                </pre>
                              </div>
                              <div>
                                <div className="mb-1 text-xs font-medium uppercase text-muted-foreground">
                                  Snapshot global
                                </div>
                                <pre className="overflow-x-auto rounded-md border border-border bg-background p-2 text-xs">
                                  {JSON.stringify(log.globalStateSnapshot, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      </CollapsibleContent>
                    </>
                  </Collapsible>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
