import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Download, Eye, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/status-badge";
import { MarkdownView } from "@/components/markdown-view";
import { useProjectsStore } from "@/stores/projects-store";
import { ARTIFACT_META, type ArtifactType } from "@/lib/types";

export const Route = createFileRoute("/projects/$id/artifacts")({
  component: ArtifactsPage,
});

function ArtifactsPage() {
  const { id } = Route.useParams();
  const project = useProjectsStore((s) => s.getProject(id));
  const [open, setOpen] = useState<ArtifactType | null>(null);

  if (!project) throw notFound();

  const items = project.selectedArtifacts.map((t) => {
    const a = project.artifacts.find((x) => x.type === t);
    return {
      type: t,
      meta: ARTIFACT_META[t],
      status: a?.status ?? "IDLE",
      iter: a?.iterationCount ?? 0,
      content: a?.content ?? "",
    };
  });

  const openItem = open ? items.find((i) => i.type === open) : null;

  const download = (filename: string, content: string) => {
    const blob = new Blob([content || `# ${filename}\n\n_Sem conteúdo gerado._\n`], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Artefatos gerados</h2>
          <p className="text-xs text-muted-foreground">
            Documentos finais em formato Markdown (RF09).
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" disabled>
          <Package className="h-4 w-4" /> Exportar tudo (.zip)
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card key={it.type}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span>{it.meta.icon}</span>
                  {it.meta.label}
                </CardTitle>
                <StatusBadge status={it.status} />
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                {it.meta.file}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge variant="secondary" className="text-[10px]">
                {it.iter} iteraç{it.iter === 1 ? "ão" : "ões"}
              </Badge>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => setOpen(it.type)}
                  disabled={!it.content}
                >
                  <Eye className="h-3.5 w-3.5" /> Visualizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => download(it.meta.file, it.content)}
                >
                  <Download className="h-3.5 w-3.5" /> Baixar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">
              {openItem?.meta.file}
            </DialogTitle>
          </DialogHeader>
          {openItem && (
            <div className="rounded-md border border-border bg-muted/30 p-4">
              <MarkdownView content={openItem.content || "_Vazio._"} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
