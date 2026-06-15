"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArtifactToolbar } from "@/components/artifact-toolbar";
import { useProjectsStore } from "@/stores/projects-store";
import { createProjectOnBackend } from "@/lib/graphql-client";
import type { ArtifactType } from "@/lib/types";

const SUGGESTIONS = [
  "App de delivery local com pagamento PIX e rastreio em tempo real",
  "SaaS de agendamento para clínicas pequenas com lembretes via WhatsApp",
  "Marketplace de cursos em vídeo com repasse automático para instrutores",
];

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useProjectsStore((s) => s.createProject);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ArtifactType[]>([
    "REQUIREMENTS",
    "USER_STORIES",
    "ARCHITECTURE_DOC",
    "UML_DIAGRAM",
  ]);

  const canSubmit =
    name.trim().length > 0 && prompt.trim().length > 0 && selected.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const input = {
      name: name.trim(),
      prompt: prompt.trim(),
      artifacts: selected,
    };

    setIsSubmitting(true);
    setError(null);
    try {
      const projectId = await createProjectOnBackend(input);
      const project = createProject({
        id: projectId,
        name: input.name,
        prompt: input.prompt,
        selectedArtifacts: input.artifacts,
      });
      router.push(`/projects/${project.id}/scope`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o projeto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
      <div className="space-y-2">
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="h-3 w-3" /> Nova requisição
        </Badge>
        <h1 className="text-3xl font-semibold tracking-tight">Descreva seu MVP</h1>
        <p className="text-sm text-muted-foreground">
          O Context Whisperer vai gerar uma proposta de escopo, distribuir tarefas para agentes
          especialistas e auditar cada artefato com um juiz restritivo.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhes do projeto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nome do projeto
            </label>
            <Input
              id="name"
              placeholder="Ex.: Delivery local"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Prompt em linguagem natural
            </label>
            <Textarea
              id="prompt"
              placeholder="Descreva o produto, público-alvo, funcionalidades essenciais e restrições conhecidas…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTIONS.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-full text-xs font-normal"
                  onClick={() => setPrompt(s)}
                >
                  {s.length > 50 ? s.slice(0, 50) + "…" : s}
                </Button>
              ))}
            </div>
          </div>

          <ArtifactToolbar value={selected} onChange={setSelected} disabled={isSubmitting} />

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button size="lg" disabled={!canSubmit} onClick={handleSubmit} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando no backend...
                </>
              ) : (
                <>
                  Gerar proposta de escopo
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
